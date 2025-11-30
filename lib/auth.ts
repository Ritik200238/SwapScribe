import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET_RAW = process.env.JWT_SECRET;

if (process.env.NODE_ENV === "production" && !JWT_SECRET_RAW) {
  throw new Error("FATAL: JWT_SECRET is missing in production environment.");
}

const JWT_SECRET = new TextEncoder().encode(
  JWT_SECRET_RAW || "fallback-secret-min-32-chars-long-here-change-me"
);

export interface SessionData {
  merchantId: string;
  email: string;
  [key: string]: string;
}

export async function createSession(data: SessionData): Promise<string> {
  const token = await new SignJWT(data as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  
  const isProduction = process.env.NODE_ENV === "production";
  
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: isProduction, 
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}