import { z } from "zod";
import { insertUserSchema, users, siteStats } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: "POST" as const,
      path: "/api/register",
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  users: {
    list: {
      method: "GET" as const,
      path: "/api/users",
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/users/:id",
      responses: {
        200: z.object({ message: z.string() }),
        403: errorSchemas.unauthorized,
      },
    },
    updateScore: {
      method: "PATCH" as const,
      path: "/api/users/:id/score",
      input: z.object({
        points: z.number(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      },
    },
  },
  admin: {
    stats: {
      method: "GET" as const,
      path: "/api/admin/stats",
      responses: {
        200: z.object({
          visits: z.number(),
          totalUsers: z.number(),
        }),
      },
    },
    logoutUser: {
      method: "POST" as const,
      path: "/api/admin/logout-user/:id",
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    resetVisits: {
      method: "POST" as const,
      path: "/api/admin/reset-visits",
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  stats: {
    visit: {
      method: "POST" as const,
      path: "/api/stats/visit",
      input: z.object({
        userId: z.number().optional(),
      }).optional(),
      responses: {
        200: z.object({ visits: z.number() }),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
