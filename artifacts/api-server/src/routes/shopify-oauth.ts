import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { Router, type IRouter, type Request } from "express";
import { eq } from "drizzle-orm";
import { db, shopifyStoresTable } from "@workspace/db";
import {
  clearOAuthStateCookie,
  getIddetSession,
  getOAuthStateCookie,
  setIddetSessionCookie,
  setOAuthStateCookie,
  upsertIddetAccount,
  type IddetIdentity,
} from "../lib/iddet-session";

const router: IRouter = Router();
const shopPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

function appBaseUrl(req: Request): string {
  const configured = process.env.APP_BASE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const protocol = req.get("x-forwarded-proto")?.split(",")[0].trim() ?? req.protocol;
  const host = req.get("x-forwarded-host")?.split(",")[0].trim() ?? req.get("host");
  return `${protocol}://${host ?? "localhost"}`;
}

function shopifyCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.SHOPIFY_API_KEY ?? process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_API_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

function verifyOAuthHmac(req: Request, secret: string): boolean {
  const queryString = req.originalUrl.split("?", 2)[1] ?? "";
  const params = new URLSearchParams(queryString);
  const provided = params.get("hmac");
  if (!provided) return false;
  params.delete("hmac");
  const canonical = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const expected = createHmac("sha256", secret).update(canonical).digest("hex");
  const expectedBytes = Buffer.from(expected, "utf8");
  const providedBytes = Buffer.from(provided, "utf8");
  return (
    expectedBytes.length === providedBytes.length &&
    timingSafeEqual(expectedBytes, providedBytes)
  );
}

function oauthErrorRedirect(req: Request, reason: string): string {
  return `${appBaseUrl(req)}/connections?shopify_error=${encodeURIComponent(reason)}`;
}

router.get("/shopify/oauth/start", async (req, res): Promise<void> => {
  const session = await getIddetSession(req);
  if (!session) {
    res.redirect(302, `${appBaseUrl(req)}/?auth=required`);
    return;
  }
  const shop = typeof req.query.shop === "string" ? req.query.shop.trim().toLowerCase() : "";
  if (!shopPattern.test(shop)) {
    res.status(400).send("Enter the myshopify.com domain for your store.");
    return;
  }
  const credentials = shopifyCredentials();
  if (!credentials) {
    res.redirect(302, oauthErrorRedirect(req, "configuration"));
    return;
  }

  const state = randomBytes(24).toString("hex");
  setOAuthStateCookie(req, res, state);
  const redirectUri = `${appBaseUrl(req)}/api/shopify/oauth/callback`;
  const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", credentials.clientId);
  authorizeUrl.searchParams.set("scope", process.env.SHOPIFY_SCOPES ?? "read_products");
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);
  res.redirect(302, authorizeUrl.toString());
});

router.get("/shopify/oauth/callback", async (req, res): Promise<void> => {
  const session = await getIddetSession(req);
  const shop = typeof req.query.shop === "string" ? req.query.shop.trim().toLowerCase() : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const stateCookie = getOAuthStateCookie(req);
  clearOAuthStateCookie(req, res);

  if (!session) {
    res.redirect(302, `${appBaseUrl(req)}/?auth=required`);
    return;
  }
  if (!shopPattern.test(shop) || !code || !stateCookie || state !== stateCookie) {
    res.redirect(302, oauthErrorRedirect(req, "invalid_response"));
    return;
  }
  const credentials = shopifyCredentials();
  if (!credentials || !verifyOAuthHmac(req, credentials.clientSecret)) {
    res.redirect(302, oauthErrorRedirect(req, credentials ? "verification_failed" : "configuration"));
    return;
  }

  let tokenResponse: globalThis.Response;
  try {
    tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        code,
      }),
    });
  } catch {
    res.redirect(302, oauthErrorRedirect(req, "shopify_unavailable"));
    return;
  }
  if (!tokenResponse.ok) {
    res.redirect(302, oauthErrorRedirect(req, "authorization_failed"));
    return;
  }

  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string;
    scope?: string;
  };
  if (!tokenPayload.access_token) {
    res.redirect(302, oauthErrorRedirect(req, "authorization_failed"));
    return;
  }

  const storeName = shop.replace(/\.myshopify\.com$/, "");
  await db
    .insert(shopifyStoresTable)
    .values({
      id: `shopify_${shop.replace(/[^a-z0-9]+/gi, "_")}`,
      storeDomain: shop,
      storeName,
      accessToken: tokenPayload.access_token,
      status: "connected",
    })
    .onConflictDoUpdate({
      target: shopifyStoresTable.storeDomain,
      set: {
        storeName,
        accessToken: tokenPayload.access_token,
        status: "connected",
        updatedAt: new Date(),
      },
    });

  const identity: IddetIdentity = {
    userId: session.userId,
    username: session.username,
    avatarUrl: session.avatarUrl,
    accessToken: session.accessToken,
  };
  await upsertIddetAccount(shop, identity);
  setIddetSessionCookie(req, res, identity, shop);
  res.redirect(302, `${appBaseUrl(req)}/connections?shopify_connected=1`);
});

export default router;