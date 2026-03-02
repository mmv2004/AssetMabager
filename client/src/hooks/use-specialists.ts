import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Specialist } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useSpecialists() {
  return useQuery<Specialist[]>({
    queryKey: [api.specialists.list.path],
    queryFn: async () => {
      const res = await fetch(api.specialists.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch specialists");
      const data = await res.json();
      return parseWithLogging(api.specialists.list.responses[200], data, "specialists.list");
    },
  });
}
