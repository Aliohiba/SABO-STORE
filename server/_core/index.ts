import "dotenv/config";
import os from "os";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // --- SECURITY MIDDLEWARE ---

  // 1. Robust Security Headers
  app.use((req, res, next) => {
    // Prevent MIME sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Prevent Clickjacking
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    // XSS Protection
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // HSTS (Strict Transport Security) - 1 Year
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    // Referrer Policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Content Security Policy (Basic) - Includes Moamalat payment gateway
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://tnpg.moamalat.net:6006; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https://tnpg.moamalat.net:6006 https://www.youtube.com https://player.vimeo.com; media-src 'self' data: blob: https:;");

    // Hide 'Express' header
    res.removeHeader("X-Powered-By");

    next();
  });

  // 2. Simple Rate Limiter (DoS Protection)
  const rateLimit = new Map();
  app.use((req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxReqs = 2000; // Allow 2000 requests per IP per window

    const record = rateLimit.get(ip) || { count: 0, startTime: now };

    if (now - record.startTime > windowMs) {
      // Reset window
      record.count = 1;
      record.startTime = now;
    } else {
      record.count++;
    }

    rateLimit.set(ip, record);

    if (record.count > maxReqs) {
      res.status(429).json({ error: "Too many requests, please try again later." });
      return;
    }

    next();
  });

  // Clean up rate limit map every hour prevent memory leak
  setInterval(() => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    Array.from(rateLimit.entries()).forEach(([ip, record]: [any, any]) => {
      if (now - record.startTime > windowMs) {
        rateLimit.delete(ip);
      }
    });
  }, 60 * 60 * 1000);

  // --- END SECURITY MIDDLEWARE ---

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "500mb" }));
  app.use(express.urlencoded({ limit: "500mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT env var or default to 5000
  const port = parseInt(process.env.PORT || "5000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
    try {
      const networkInterfaces = os.networkInterfaces();
      Object.keys(networkInterfaces).forEach((key) => {
        const interfaces = networkInterfaces[key];
        interfaces?.forEach((details) => {
          const family = String(details.family);
          if ((family === "IPv4" || family === "4") && !details.internal) {
            console.log(`Network: http://${details.address}:${port}/`);
          }
        });
      });
    } catch (e) {
      // ignore
    }
  });

  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please free up port ${port} or choose another one.`);
      process.exit(1);
    } else {
      console.error(e);
      process.exit(1);
    }
  });
}

// Force restart logic (Vanex Trigger Fix)
startServer().catch(console.error);
