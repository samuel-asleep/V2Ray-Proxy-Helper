import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertServerConfig, type ServerConfig } from "@shared/schema";

export function useServerConfig() {
  return useQuery({
    queryKey: [api.config.get.path],
    queryFn: async () => {
      const res = await fetch(api.config.get.path);
      if (!res.ok) throw new Error("Failed to fetch config");
      return api.config.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertServerConfig) => {
      const validated = api.config.update.input.parse(data);
      const res = await fetch(api.config.update.path, {
        method: api.config.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to update config");
      return api.config.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.config.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.status.get.path] });
    },
  });
}

export function useServerStatus() {
  return useQuery({
    queryKey: [api.status.get.path],
    queryFn: async () => {
      const res = await fetch(api.status.get.path);
      if (!res.ok) throw new Error("Failed to fetch status");
      return api.status.get.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

export function useRestartServer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.status.restart.path, {
        method: api.status.restart.method,
      });
      if (!res.ok) throw new Error("Failed to restart server");
      return api.status.restart.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.status.get.path] });
    },
  });
}

export function useServerLogs() {
  return useQuery({
    queryKey: [api.logs.get.path],
    queryFn: async () => {
      const res = await fetch(api.logs.get.path);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.get.responses[200].parse(await res.json());
    },
    refetchInterval: 3000,
  });
}
