import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, shopifyStoresTable } from "@workspace/db";
import type { Request } from "express";
import { getIddetSession } from "./iddet-session";

type ShopifyClaims = {
  aud?: string;
  dest?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  nbf?: number;
  sub?: string;
};

export type ShopifySession = {
  shopDomain: string;
  shopName: string;
  userId: string | null;
  userName: string | null;
  accessToken: string | null;
};

const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-10";

function decodePart(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function parseToken(token: string): {
  header: Record<string, unknown>;
  claims: ShopifyClaims;
  signature: string;
  signed: string;
} {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed Shopify session token.");
  const [encodedHeader, encodedClaims, signature] = parts;
  return {
    header: JSON.parse(decodePart(encodedHeader)) as Record<string, unknown>,
    claims: JSON.parse(decodePart(encodedClaims)) as ShopifyClaims,
    signature,
    signed: `${encodedHeader}.${encodedClaims}`,
  };
}

function verifyToken(token: string): ShopifyClaims {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) throw new Error("SHOPIFY_API_SECRET is not configured.");

  const parsed = parseToken(token);
  if (parsed.header.alg !== "HS256") throw new Error("Unsupported Shopify token algorithm.");
  const expected = createHmac("sha256", secret).update(parsed.signed).digest("base64url");
  const actualBuffer = Buffer.from(parsed.signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid Shopify session token signature.");
  }

  const now = Math.floor(Date.now() / 1000);
  if (!parsed.claims.exp || parsed.claims.exp <= now) {
    throw new Error("Shopify session token expired.");
  }
  if (parsed.claims.nbf && parsed.claims.nbf > now + 30) {
    throw new Error("Shopify session token is not active yet.");
  }

  const apiKey = process.env.SHOPIFY_API_KEY ?? process.env.SHOPIFY_CLIENT_ID;
  if (apiKey && parsed.claims.aud !== apiKey) {
    throw new Error("Shopify session token audience mismatch.");
  }
  return parsed.claims;
}

function shopFromClaims(claims: ShopifyClaims): string {
  if (!claims.dest) throw new Error("Shopify session token has no shop destination.");
  const shop = new URL(claims.dest).hostname.toLowerCase();
  if (!shop || shop === "localhost" || !shop.includes(".")) {
    throw new Error("Shopify session token has an invalid shop destination.");
  }
  if (!claims.iss) throw new Error("Shopify session token has no issuer.");
  const issuer = new URL(claims.iss);
  if (issuer.hostname.toLowerCase() !== shop || issuer.pathname.replace(/\/$/, "") !== "/admin") {
    throw new Error("Shopify session token issuer mismatch.");
  }
  return shop;
}

async function exchangeForOfflineToken(
  shopDomain: string,
  sessionToken: string,
  tokenAudience: string | undefined,
): Promise<string | null> {
  const clientId = process.env.SHOPIFY_API_KEY ?? process.env.SHOPIFY_CLIENT_ID ?? tokenAudience;
  const clientSecret = process.env.SHOPIFY_API_SECRET;
  if (!clientId || !clientSecret) return null;

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    client_id: clientId,
    client_secret: clientSecret,
    subject_token: sessionToken,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    requested_token_type: "urn:shopify:params:oauth:token-type:offline-access-token",
  });
  const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { access_token?: string };
  return payload.access_token ?? null;
}

function shopNameFromDomain(shopDomain: string): string {
  return shopDomain.endsWith(".myshopify.com")
    ? shopDomain.slice(0, -".myshopify.com".length)
    : shopDomain;
}

async function persistShopifySession(
  shopDomain: string,
  accessToken: string | null,
): Promise<void> {
  const id = `shopify_${shopDomain.replace(/[^a-z0-9]+/gi, "_")}`;
  await db
    .insert(shopifyStoresTable)
    .values({
      id,
      storeDomain: shopDomain,
      storeName: shopNameFromDomain(shopDomain),
      accessToken,
      status: accessToken ? "connected" : "needs_reauth",
    })
    .onConflictDoUpdate({
      target: shopifyStoresTable.storeDomain,
      set: {
        storeName: shopNameFromDomain(shopDomain),
        ...(accessToken ? { accessToken, status: "connected" } : {}),
        updatedAt: new Date(),
      },
    });
}

export async function authenticateShopifyRequest(req: Request): Promise<ShopifySession> {
  const iddetSession = await getIddetSession(req);
  if (!iddetSession) throw new Error("IDDET login session is required.");

  const authorization = req.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  const claims = token ? verifyToken(token) : null;
  const requestedShopDomain = claims
    ? shopFromClaims(claims)
    : iddetSession.shopDomain ?? iddetSession.tenantDomain;
  if (claims && iddetSession.shopDomain && iddetSession.shopDomain !== requestedShopDomain) {
    throw new Error("IDDET session is connected to a different Shopify shop.");
  }
  const [storedShop] = await db
    .select({
      accessToken: shopifyStoresTable.accessToken,
      storeDomain: shopifyStoresTable.storeDomain,
      storeName: shopifyStoresTable.storeName,
    })
    .from(shopifyStoresTable)
    .where(eq(shopifyStoresTable.storeDomain, requestedShopDomain))
    .limit(1);

  const accessToken =
    storedShop?.accessToken ??
    (claims
      ? await exchangeForOfflineToken(requestedShopDomain, token, claims.aud)
      : null);
  if (claims) await persistShopifySession(requestedShopDomain, accessToken);

  return {
    shopDomain: requestedShopDomain,
    shopName:
      storedShop?.storeName ??
      (iddetSession.shopDomain ? shopNameFromDomain(iddetSession.shopDomain) : iddetSession.username),
    userId: iddetSession.userId,
    userName: iddetSession.username,
    accessToken,
  };
}

export async function shopifyGraphql<T>(
  session: ShopifySession,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!session.accessToken) {
    throw new Error("Shopify Admin access token is unavailable. Reopen the app to reauthorize.");
  }
  const response = await fetch(
    `https://${session.shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  if (!response.ok) throw new Error(`Shopify Admin API returned ${response.status}.`);
  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message ?? "Shopify GraphQL error").join("; "));
  }
  if (!payload.data) throw new Error("Shopify Admin API returned no data.");
  return payload.data;
}