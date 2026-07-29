import { env } from "cloudflare:workers";
import { cookies } from "next/headers";

const COOKIE_NAME = "muddy_root_staff";
const SESSION_MESSAGE = "muddy-root-staff-session-v1";

function secrets() {
  return env as unknown as {
    STAFF_PASSCODE?: string;
    STAFF_SESSION_SECRET?: string;
  };
}

async function digest(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function sessionToken(): Promise<string | null> {
  const secret = secrets().STAFF_SESSION_SECRET;
  if (!secret) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(SESSION_MESSAGE)),
  );
  return Array.from(signature, byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function passcodeMatches(candidate: string): Promise<boolean> {
  const expected = secrets().STAFF_PASSCODE;
  if (!expected) return false;
  const [candidateDigest, expectedDigest] = await Promise.all([digest(candidate), digest(expected)]);
  return equalBytes(candidateDigest, expectedDigest);
}

export async function isStaffAuthenticated(): Promise<boolean> {
  const expected = await sessionToken();
  const supplied = (await cookies()).get(COOKIE_NAME)?.value;
  if (!expected || !supplied) return false;
  return equalBytes(await digest(supplied), await digest(expected));
}

export async function createStaffSession(): Promise<void> {
  const token = await sessionToken();
  if (!token) throw new Error("Staff access is not configured");
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}
