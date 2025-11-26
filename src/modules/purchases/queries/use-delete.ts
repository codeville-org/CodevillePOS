import { useElectronAPI } from "@/hooks/use-electron-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const api = useElectronAPI();

      const response = await api.purchase.delete(id);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to update purchase");
      }

      const data = response.data;
      return data;
    },
    onMutate: () => {
      toast.loading("Deleting purchase...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Purchase deleted successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete purchase", {
        id: toastId
      });
    }
  });

  return mutation;
};
