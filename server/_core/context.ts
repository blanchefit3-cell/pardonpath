import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifyToken, extractBearerToken } from "./supabase-auth";
import { getUserBySupabaseId, upsertUser } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Extract Bearer token from Authorization header
    const authHeader = opts.req.headers.authorization;
    const token = extractBearerToken(authHeader);

    if (token) {
      // Verify token with Supabase
      const supabaseUser = await verifyToken(token);

      if (supabaseUser) {
        // Look up user in database to get role and other metadata
        let dbUser = await getUserBySupabaseId(supabaseUser.id);

        // If user not in DB, create them
        if (!dbUser) {
          await upsertUser({
            email: supabaseUser.email || "unknown@example.com",
            name: supabaseUser.user_metadata?.name || null,
            openId: supabaseUser.id,
            loginMethod: "supabase",
          });
          dbUser = await getUserBySupabaseId(supabaseUser.id);
        }

        if (dbUser) {
          user = dbUser;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
