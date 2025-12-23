import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const serverConfig = pgTable("server_config", {
  id: serial("id").primaryKey(),
  uuid: text("uuid").notNull(),
  path: text("path").notNull().default("/vmess"),
  port: integer("port").notNull().default(10000),
  sni: text("sni").notNull().default(""), // For display/client config generation
  isRunning: boolean("is_running").notNull().default(true),
});

export const insertServerConfigSchema = createInsertSchema(serverConfig).omit({ 
  id: true, 
  isRunning: true 
});

export const updateServerConfigSchema = insertServerConfigSchema.partial();

export type ServerConfig = typeof serverConfig.$inferSelect;
export type InsertServerConfig = z.infer<typeof insertServerConfigSchema>;
export type UpdateServerConfig = z.infer<typeof updateServerConfigSchema>;

export const logSchema = z.object({
  lines: z.array(z.string()),
});

export type ServerLogs = z.infer<typeof logSchema>;
