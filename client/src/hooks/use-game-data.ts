import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Admin & Stats Hooks
export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.stats.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return await res.json();
    },
  });
}

export function useUsersList() {
  return useQuery({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.users.list.path);
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.users.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });
}

export function useUpdateScore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, points }: { id: number; points: number }) => {
      const url = buildUrl(api.users.updateScore.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });
      if (!res.ok) throw new Error("Failed to update score");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
    },
  });
}

export function useRecordVisit() {
  return useMutation({
    mutationFn: async () => {
      const auth = localStorage.getItem("spygame_user");
      const currentUser = auth ? JSON.parse(auth) : null;
      
      const res = await fetch(api.stats.visit.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser?.id }),
      });
      return await res.json();
    },
  });
}
