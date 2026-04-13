/**
 * Supabase Auth Helper
 * Handles token verification and user lookup using Supabase Admin API
 */

import { createClient } from "@supabase/supabase-js";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "[Supabase Auth] ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
  );
}

// Create admin client for token verification (service role key has elevated privileges)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Verify an access token and return the authenticated user
 * @param token - The JWT access token from the Authorization header
 * @returns The Supabase user object or null if verification fails
 */
export async function verifyToken(token: string): Promise<SupabaseUser | null> {
  if (!token) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      console.warn("[Supabase Auth] Token verification failed:", error.message);
      return null;
    }

    if (!data.user) {
      console.warn("[Supabase Auth] No user found for token");
      return null;
    }

    return data.user;
  } catch (error) {
    console.error("[Supabase Auth] Token verification error:", error);
    return null;
  }
}

/**
 * Extract the Bearer token from an Authorization header
 * @param authHeader - The Authorization header value
 * @returns The token or null if not found or invalid
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  const token = parts[1];
  if (!token || token.length === 0) {
    return null;
  }

  return token;
}
