import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import * as db from "../db-mongo";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // الاعتماد الكامل على sdk.authenticateRequest التي تدعم الآن Admin و Customer و Users
  try {
    user = await sdk.authenticateRequest(opts.req);
    // console.log("[Context] User Authenticated:", user?.role, user?.id);
  } catch (error) {
    // console.log("[Context] Auth Failed/Guest:", error);
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
