import { useElectronAPI } from "@/hooks/use-electron-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const api = useElectronAPI();

      const response = await api.user.delete(id);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to delete user");
      }

      const data = response.data;
      return data;
    },
    onMutate: () => {
      toast.loading("Deleting user...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("User deleted successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user", {
        id: toastId
      });
    }
  });

  return mutation;
};
