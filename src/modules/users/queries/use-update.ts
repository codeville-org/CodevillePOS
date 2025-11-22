import { useElectronAPI } from "@/hooks/use-electron-api";
import { UpdateUserSchema } from "@/lib/zod/user.zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (values: UpdateUserSchema) => {
      const api = useElectronAPI();

      const response = await api.user.update(id, values);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to update user");
      }

      const data = response.data;
      return data;
    },
    onMutate: () => {
      toast.loading("Updating user...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("User updated successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user", {
        id: toastId
      });
    }
  });

  return mutation;
};
