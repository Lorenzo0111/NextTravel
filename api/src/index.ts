import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoute } from "./routes/auth";
import { imageRoute } from "./routes/image";
import { retrieverRoute } from "./routes/retriever";
import { planRoute } from "./routes/plan";

const app = new Hono()
  .use(
    cors({
      origin: "*",
      allowHeaders: ["Authorization", "Content-Type", "User-Agent"],
      allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE", "PATCH"],
      exposeHeaders: ["Content-Length", "Content-Type", "Content-Disposition"],
      maxAge: 600,
    }),
  )
  .route("/auth", authRoute)
  .route("/plan", planRoute)
  .route("/retriever", retrieverRoute)
  .route("/image", imageRoute);

serve(app);
export type AppType = typeof app;
export type * from "./constants/requests";
export type { responseType } from "./constants/ai";
