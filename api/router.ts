import { authRouter } from "./auth-router";
import { kinshipRouter } from "./kinship-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  kinship: kinshipRouter,
});

export type AppRouter = typeof appRouter;
