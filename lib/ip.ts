import { headers } from "next/headers";

/**
 * Extract user IP address from request headers with Vercel/Production priority.
 * Required for SideShift API x-user-ip header to avoid rate limits and ensure compliance.
 * 
 * GUARANTEE: This function NEVER returns undefined/null.
 */
export async function getUserIp(): Promise<string> {
  const headersList = await headers();

  // 1. Vercel / Proxies (Most trusted)
  const vercelForwardedFor = headersList.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  // 2. Standard Forwarded For (Load Balancers)
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // 3. Direct Real IP (Nginx/Apache)
  const realIp = headersList.get("x-real-ip");
  if (realIp) return realIp.trim();

  // 4. Cloudflare
  const cfIp = headersList.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // 5. Fallback for localhost (never return empty)
  return "127.0.0.1";
}