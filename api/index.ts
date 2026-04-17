import express from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

let appPromise: Promise<express.Express>;

function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const app = express();
      const httpServer = createServer(app);

      // We need the same middleware from server/index.ts
      app.use(
        express.json({
          limit: "50mb", // Good for file uploads in web portal
          verify: (req: any, _res, buf) => {
            req.rawBody = buf;
          },
        })
      );
      app.use(express.urlencoded({ extended: false, limit: "50mb" }));

      await registerRoutes(httpServer, app);

      // error handler
      app.use((err: any, _req: any, res: any, _next: any) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
      });

      return app;
    })();
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  app(req, res);
}
