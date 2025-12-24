import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { v2ray } from "./v2ray";
import { api } from "@shared/routes";
import { z } from "zod";
import httpProxy from "http-proxy";
import { ServerConfig } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize V2Ray
  const config = await storage.getConfig();
  await v2ray.start(config);

  // Proxy for WebSocket
  const proxy = httpProxy.createProxyServer({
    ws: true,
  });

  // Handle Upgrade requests manually
  httpServer.on('upgrade', async (req, socket, head) => {
    try {
      const currentConfig = await storage.getConfig();
      const requestPath = req.url?.split('?')[0]; // Remove query params
      
      if (requestPath === currentConfig.path) {
        console.log(`[PROXY] WebSocket upgrade request: ${req.url} -> ws://127.0.0.1:${currentConfig.port}${currentConfig.path}`);
        proxy.ws(req, socket, head, {
          target: `ws://127.0.0.1:${currentConfig.port}`,
        }, (err) => {
          console.error('[PROXY] Error:', err.message);
          socket.destroy();
        });
      } else {
        console.log(`[PROXY] Path mismatch: ${requestPath} !== ${currentConfig.path}`);
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
      }
    } catch (err: any) {
      console.error('[PROXY] Exception:', err.message);
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      socket.destroy();
    }
  });

  // API Routes
  app.get(api.config.get.path, async (req, res) => {
    const config = await storage.getConfig();
    res.json(config);
  });

  app.post(api.config.update.path, async (req, res) => {
    try {
      const input = api.config.update.input.parse(req.body);
      const updated = await storage.updateConfig(input);
      
      // Restart V2Ray with new config
      await v2ray.start(updated);
      
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input" });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.status.get.path, (req, res) => {
    res.json({
      running: v2ray.isRunning(),
    });
  });

  app.post(api.status.restart.path, async (req, res) => {
    const config = await storage.getConfig();
    await v2ray.start(config);
    res.json({ success: true });
  });

  app.get(api.logs.get.path, (req, res) => {
    res.json({ lines: v2ray.getLogs() });
  });

  return httpServer;
}
