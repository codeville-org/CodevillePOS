import { useElectronAPI } from "@/hooks/use-electron-api";
import { InsertUserSchema } from "@/lib/zod/user.zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (values: InsertUserSchema) => {
      const api = useElectronAPI();

      const response = await api.user.create(values);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to create user");
      }

      const data = response.data;
      return data;
    },
    onMutate: () => {
      toast.loading("Creating a new user...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("User created successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create user", {
        id: toastId
      });
    }
  });

  return mutation;
};
