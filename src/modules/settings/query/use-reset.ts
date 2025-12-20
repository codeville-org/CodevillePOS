import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";

import { useElectronAPI } from "@/hooks/use-electron-api";

export const useSystemReset = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async () => {
      const api = useElectronAPI();

      const response = await api.settings.reset();

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to reset system");
      }

      const data = response.data;
      return data;
    },
    onMutate: () => {
      toast.loading("System getting resetted...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("System reset successfully!", { id: toastId });
      queryClient.invalidateQueries({
        queryKey: [
          "settings",
          "products",
          "transactions",
          "products",
          "categories",
          "customers"
        ]
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset system", {
        id: toastId
      });
    }
  });

  return mutation;
};
