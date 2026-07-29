import { env } from "cloudflare:workers";
import { createStaffSession, passcodeMatches } from "../../../staff-auth";

const attemptsSchema = `CREATE TABLE IF NOT EXISTS staff_login_attempts (key TEXT PRIMARY KEY, failures INTEGER NOT NULL, blocked_until INTEGER NOT NULL, updated_at INTEGER NOT NULL)`;
const MAX_FAILURES = 5;
const BLOCK_TIME = 15 * 60 * 1000;

async function attemptKey(request: Request): Promise<string> {
  const address = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const secret = (env as unknown as { STAFF_SESSION_SECRET?: string }).STAFF_SESSION_SECRET ?? "unconfigured";
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${secret}:${address}`)));
  return Array.from(digest, byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { passcode?: string } | null;
  if (!body?.passcode) return Response.json({ error: "Enter the staff passcode." }, { status: 400 });

  await env.DB.prepare(attemptsSchema).run();
  const key = await attemptKey(request);
  const now = Date.now();
  const attempt = await env.DB.prepare("SELECT failures, blocked_until FROM staff_login_attempts WHERE key = ?").bind(key).first<{ failures: number; blocked_until: number }>();

  if (attempt && attempt.blocked_until > now) {
    return Response.json({ error: "Too many tries. Please wait 15 minutes." }, { status: 429 });
  }

  if (!await passcodeMatches(body.passcode)) {
    const failures = (attempt?.failures ?? 0) + 1;
    const blockedUntil = failures >= MAX_FAILURES ? now + BLOCK_TIME : 0;
    await env.DB.prepare("INSERT INTO staff_login_attempts (key, failures, blocked_until, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET failures = excluded.failures, blocked_until = excluded.blocked_until, updated_at = excluded.updated_at")
      .bind(key, failures >= MAX_FAILURES ? 0 : failures, blockedUntil, now).run();
    return Response.json({ error: "That passcode didn’t work." }, { status: 401 });
  }

  await env.DB.prepare("DELETE FROM staff_login_attempts WHERE key = ?").bind(key).run();
  await createStaffSession();
  return Response.json({ authenticated: true });
}
