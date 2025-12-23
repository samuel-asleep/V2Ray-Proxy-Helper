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
    const currentConfig = await storage.getConfig();
    if (req.url === currentConfig.path) {
      console.log(`Proxying WebSocket request for ${req.url} to port ${currentConfig.port}`);
      proxy.ws(req, socket, head, {
        target: `ws://127.0.0.1:${currentConfig.port}`,
      }, (err) => {
        console.error('Proxy error:', err);
        socket.end();
      });
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
