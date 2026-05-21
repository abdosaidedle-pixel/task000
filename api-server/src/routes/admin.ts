import { Router } from "express";
import { randomBytes } from "crypto";
import { AdminLoginBody, AdminLoginResponse, GetAdminMeResponse } from "@workspace/api-zod";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "adam2024";

const tokenStore = new Map<string, { username: string; expiry: Date }>();

function getTokenFromRequest(req: any): { username: string } | null {
  const auth = req.headers.authorization as string | undefined;
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const entry = tokenStore.get(token);
    if (entry && entry.expiry > new Date()) {
      return { username: entry.username };
    }
  }
  return null;
}

export function requireAdmin(req: any, res: any, next: any): void {
  if (req.session?.isAdmin) return next();
  const tokenUser = getTokenFromRequest(req);
  if (tokenUser) {
    req.session.isAdmin = true;
    req.session.username = tokenUser.username;
    return next();
  }
  res.status(401).json({ error: "غير مصرح" });
}

const router = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  tokenStore.set(token, { username, expiry });

  // @ts-ignore
  req.session.isAdmin = true;
  // @ts-ignore
  req.session.username = username;

  res.json({ ...AdminLoginResponse.parse({ isAdmin: true, username }), token });
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  // @ts-ignore
  req.session.destroy?.(() => {});
  res.sendStatus(204);
});

router.get("/admin/me", async (req, res): Promise<void> => {
  // @ts-ignore
  if (req.session?.isAdmin) {
    // @ts-ignore
    res.json(GetAdminMeResponse.parse({ isAdmin: true, username: req.session.username ?? "admin" }));
    return;
  }
  const tokenUser = getTokenFromRequest(req);
  if (tokenUser) {
    res.json(GetAdminMeResponse.parse({ isAdmin: true, username: tokenUser.username }));
    return;
  }
  res.status(401).json({ error: "Not authenticated" });
});

export default router;
