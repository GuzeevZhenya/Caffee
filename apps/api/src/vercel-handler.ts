import { handle } from "hono/vercel";
import { app } from "./app";

export const config = {
  runtime: "nodejs" as const,
  maxDuration: 30,
};

/** Vercel Node Function: все методы `/api/*`. */
export default handle(app);
