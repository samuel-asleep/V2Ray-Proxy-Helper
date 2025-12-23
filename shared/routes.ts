import { z } from 'zod';
import { insertServerConfigSchema, logSchema, serverConfig } from './schema';

export const api = {
  config: {
    get: {
      method: 'GET' as const,
      path: '/api/config',
      responses: {
        200: z.custom<typeof serverConfig.$inferSelect>(),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/config',
      input: insertServerConfigSchema,
      responses: {
        200: z.custom<typeof serverConfig.$inferSelect>(),
      },
    },
  },
  status: {
    get: {
      method: 'GET' as const,
      path: '/api/status',
      responses: {
        200: z.object({
          running: z.boolean(),
          uptime: z.number().optional(),
        }),
      },
    },
    restart: {
      method: 'POST' as const,
      path: '/api/restart',
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    }
  },
  logs: {
    get: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: logSchema,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
