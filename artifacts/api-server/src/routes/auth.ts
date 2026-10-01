import { Router, type IRouter } from "express";
import {
  GetIddetSessionResponse,
  LoginWithIddetBody,
  LoginWithIddetResponse,
  LogoutIddetResponse,
} from "@workspace/api-zod";
import {
  clearIddetSessionCookie,
  getIddetSession,
  isSameOriginRequest,
  setIddetSessionCookie,
  tenantDomainForIddetUser,
  upsertIddetAccount,
  type IddetIdentity,
} from "../lib/iddet-session";

const router: IRouter = Router();
const IDDET_API_BASE_URL = (
  process.env.IDDET_API_BASE_URL ?? "https://hoosthubs-g.onrender.com"
).replace(/\/$/, "");

router.get("/auth/session", async (req, res): Promise<void> => {
  const session = await getIddetSession(req);
  res.json(
    GetIddetSessionResponse.parse(
      session
        ? {
            authenticated: true,
            username: session.username,
            avatarUrl: session.avatarUrl,
            shopDomain: session.shopDomain,
          }
        : {
            authenticated: false,
            username: null,
            avatarUrl: null,
            shopDomain: null,
          },
    ),
  );
});

router.post("/auth/iddet/login", async (req, res): Promise<void> => {
  if (!isSameOriginRequest(req)) {
    res.status(403).json({ error: "Requête non autorisée." });
    return;
  }
  const parsed = LoginWithIddetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Saisis ton nom d’utilisateur et ton mot de passe IDDET." });
    return;
  }

  const form = new URLSearchParams({
    username: parsed.data.username.trim(),
    password: parsed.data.password,
  });
  let response: globalThis.Response;
  try {
    response = await fetch(`${IDDET_API_BASE_URL}/api/token`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
  } catch {
    res.status(502).json({ error: "Le service IDDET est temporairement indisponible." });
    return;
  }
  if (!response.ok) {
    res.status(response.status === 401 ? 401 : 502).json({
      error:
        response.status === 401
          ? "Nom d’utilisateur ou mot de passe IDDET incorrect."
          : "Le service IDDET n’a pas pu confirmer la connexion.",
    });
    return;
  }

  let remote: {
    access_token?: string;
    user_id?: string | number;
    username?: string;
    avatar_url?: string | null;
  };
  try {
    remote = (await response.json()) as typeof remote;
  } catch {
    res.status(502).json({ error: "Le service IDDET a renvoyé une réponse invalide." });
    return;
  }
  if (!remote.access_token || !remote.username) {
    res.status(502).json({ error: "Le service IDDET a renvoyé une réponse de connexion incomplète." });
    return;
  }

  const userId = String(remote.user_id ?? remote.username.toLowerCase());
  const identity: IddetIdentity = {
    userId,
    username: remote.username,
    avatarUrl:
      remote.avatar_url ??
      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(remote.username)}`,
    accessToken: remote.access_token,
  };
  const session = setIddetSessionCookie(req, res, identity);
  await upsertIddetAccount(tenantDomainForIddetUser(userId), identity);

  res.json(
    LoginWithIddetResponse.parse({
      authenticated: true,
      username: session.username,
      avatarUrl: session.avatarUrl,
      shopDomain: null,
    }),
  );
});

router.post("/auth/logout", (req, res): void => {
  if (!isSameOriginRequest(req)) {
    res.status(403).json({ error: "Requête non autorisée." });
    return;
  }
  clearIddetSessionCookie(req, res);
  res.json(
    LogoutIddetResponse.parse({
      authenticated: false,
      username: null,
      avatarUrl: null,
      shopDomain: null,
    }),
  );
});

export default router;