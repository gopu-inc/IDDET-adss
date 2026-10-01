import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db, iddetAccountsTable } from "@workspace/db";

const SESSION_COOKIE = "iddet_session";
const OAUTH_STATE_COOKIE = "iddet_shopify_oauth_state";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type IddetIdentity = {
  userId: string;
  username: string;
  avatarUrl: string;
  accessToken: string;
};

export type IddetLoginSession = IddetIdentity & {
  tenantDomain: string;
  shopDomain: string | null;
  expiresAt: number;
};

type SignedIddetSession = Omit<IddetLoginSession, "accessToken">;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured.");
  return secret;
}

function cookieValue(req: Request, name: string): string | null {
  const header = req.get("cookie");
  if (!header) return null;
  for (const entry of header.split(";")) {
    const separator = entry.indexOf("=");
    if (separator < 0 || entry.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(entry.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function verifySignedValue(value: string): string | null {
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const payload = value.slice(0, separator);
  const provided = Buffer.from(value.slice(separator + 1));
  const expected = Buffer.from(sign(payload));
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  return payload;
}

function cookieAttributes(req: Request, maxAge: number): string {
  const secure =
    req.secure || req.get("x-forwarded-proto")?.split(",")[0].trim() === "https";
  // Shopify embeds the app in an admin iframe. Secure, partitioned cookies let
  // the app keep its IDDET session without exposing tokens to browser code.
  const sameSite = secure ? "SameSite=None; Secure; Partitioned" : "SameSite=Lax";
  return `Path=/; HttpOnly; ${sameSite}; Max-Age=${maxAge}`;
}

function appendCookie(res: Response, cookie: string): void {
  res.append("Set-Cookie", cookie);
}

export function tenantDomainForIddetUser(userId: string): string {
  const fingerprint = createHash("sha256").update(userId).digest("hex").slice(0, 24);
  return `iddet-${fingerprint}.local`;
}

export function setIddetSessionCookie(
  req: Request,
  res: Response,
  identity: IddetIdentity,
  shopDomain: string | null = null,
): IddetLoginSession {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const session: IddetLoginSession = {
    ...identity,
    tenantDomain: tenantDomainForIddetUser(identity.userId),
    shopDomain,
    expiresAt,
  };
  const { accessToken: _accessToken, ...signedSession } = session;
  const encoded = Buffer.from(JSON.stringify(signedSession)).toString("base64url");
  appendCookie(
    res,
    `${SESSION_COOKIE}=${encodeURIComponent(`${encoded}.${sign(encoded)}`)}; ${cookieAttributes(req, SESSION_MAX_AGE_SECONDS)}`,
  );
  return session;
}

export async function getIddetSession(req: Request): Promise<IddetLoginSession | null> {
  const cookie = cookieValue(req, SESSION_COOKIE);
  if (!cookie) return null;
  const payload = verifySignedValue(cookie);
  if (!payload) return null;
  let session: SignedIddetSession;
  try {
    session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SignedIddetSession;
  } catch {
    return null;
  }
  if (
    !session.userId ||
    !session.username ||
    !session.tenantDomain ||
    !session.expiresAt ||
    session.expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return null;
  }
  const accountDomain = session.shopDomain ?? session.tenantDomain;
  const [account] = await db
    .select({ accessToken: iddetAccountsTable.accessToken })
    .from(iddetAccountsTable)
    .where(
      and(
        eq(iddetAccountsTable.shopDomain, accountDomain),
        eq(iddetAccountsTable.username, session.username),
      ),
    )
    .limit(1);
  if (!account?.accessToken) return null;
  return { ...session, accessToken: account.accessToken };
}

export function clearIddetSessionCookie(req: Request, res: Response): void {
  appendCookie(res, `${SESSION_COOKIE}=; ${cookieAttributes(req, 0)}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
}

export function setOAuthStateCookie(req: Request, res: Response, state: string): void {
  appendCookie(res, `${OAUTH_STATE_COOKIE}=${encodeURIComponent(state)}; ${cookieAttributes(req, 300)}`);
}

export function getOAuthStateCookie(req: Request): string | null {
  return cookieValue(req, OAUTH_STATE_COOKIE);
}

export function clearOAuthStateCookie(req: Request, res: Response): void {
  appendCookie(
    res,
    `${OAUTH_STATE_COOKIE}=; ${cookieAttributes(req, 0)}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  );
}

export function isSameOriginRequest(req: Request): boolean {
  const origin = req.get("origin");
  if (!origin) return req.method === "GET" || req.method === "HEAD";
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0].trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0].trim();
  const protocol = forwardedProto ?? req.protocol;
  const host = forwardedHost ?? req.get("host");
  return Boolean(host && origin === `${protocol}://${host}`);
}

export async function upsertIddetAccount(shopDomain: string, identity: IddetIdentity) {
  const [existing] = await db
    .select({ id: iddetAccountsTable.id })
    .from(iddetAccountsTable)
    .where(
      and(
        eq(iddetAccountsTable.shopDomain, shopDomain),
        eq(iddetAccountsTable.username, identity.username),
      ),
    );

  const id =
    existing?.id ??
    `iddet_${createHash("sha256")
      .update(`${shopDomain}:${identity.userId}`)
      .digest("hex")
      .slice(0, 32)}`;
  const [account] = await db
    .insert(iddetAccountsTable)
    .values({
      id,
      shopDomain,
      username: identity.username,
      avatarUrl: identity.avatarUrl,
      accessToken: identity.accessToken,
    })
    .onConflictDoUpdate({
      target: [iddetAccountsTable.shopDomain, iddetAccountsTable.username],
      set: {
        avatarUrl: identity.avatarUrl,
        accessToken: identity.accessToken,
        connectedAt: new Date(),
      },
    })
    .returning();
  return account;
}