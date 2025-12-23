import { db } from "./db";
import { serverConfig, type ServerConfig, type InsertServerConfig, type UpdateServerConfig } from "@shared/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export interface IStorage {
  getConfig(): Promise<ServerConfig>;
  updateConfig(updates: UpdateServerConfig): Promise<ServerConfig>;
  setRunning(isRunning: boolean): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getConfig(): Promise<ServerConfig> {
    const configs = await db.select().from(serverConfig).limit(1);
    if (configs.length === 0) {
      // Create default config
      const defaultConfig: InsertServerConfig = {
        uuid: uuidv4(),
        path: "/vmess",
        port: 10000,
        sni: "example.com",
      };
      const [newConfig] = await db.insert(serverConfig).values(defaultConfig).returning();
      return newConfig;
    }
    return configs[0];
  }

  async updateConfig(updates: UpdateServerConfig): Promise<ServerConfig> {
    // We only have one row, so we update the one with existing ID or the first one
    const current = await this.getConfig();
    const [updated] = await db.update(serverConfig)
      .set(updates)
      .where(eq(serverConfig.id, current.id))
      .returning();
    return updated;
  }

  async setRunning(isRunning: boolean): Promise<void> {
    const current = await this.getConfig();
    await db.update(serverConfig)
      .set({ isRunning })
      .where(eq(serverConfig.id, current.id));
  }
}

export const storage = new DatabaseStorage();
