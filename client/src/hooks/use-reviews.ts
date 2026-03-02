import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Review } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useReviews() {
  return useQuery<Review[]>({
    queryKey: [api.reviews.list.path],
    queryFn: async () => {
      const res = await fetch(api.reviews.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      return parseWithLogging(api.reviews.list.responses[200], data, "reviews.list");
    },
  });
}
