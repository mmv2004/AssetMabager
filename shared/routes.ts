import { z } from 'zod';
import { insertBookingSchema, bookings, services, specialists, reviews } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  services: {
    list: {
      method: 'GET' as const,
      path: '/api/services' as const,
      responses: { 200: z.array(z.custom<typeof services.$inferSelect>()) },
    }
  },
  specialists: {
    list: {
      method: 'GET' as const,
      path: '/api/specialists' as const,
      responses: { 200: z.array(z.custom<typeof specialists.$inferSelect>()) },
    }
  },
  reviews: {
    list: {
      method: 'GET' as const,
      path: '/api/reviews' as const,
      responses: { 200: z.array(z.custom<typeof reviews.$inferSelect>()) },
    }
  },
  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings' as const,
      responses: { 200: z.array(z.custom<typeof bookings.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings' as const,
      input: insertBookingSchema,
      responses: { 
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation 
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id/status' as const,
      input: z.object({ status: z.enum(['new', 'confirmed', 'rejected']) }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        404: errorSchemas.notFound
      }
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
