import { useElectronAPI } from "@/hooks/use-electron-api";
import { UpdatePurchaseItemSchema } from "@/lib/zod/supplier.zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

interface MutationPayload {
  id: string;
  input: UpdatePurchaseItemSchema;
}

export const useUpdatePurchaseItem = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (payload: MutationPayload) => {
      const api = useElectronAPI();

      const response = await api.purchase.updateItem(payload.id, payload.input);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to update purchase item");
      }

      const data = response.data;
      return data;
    },
    onMutate: () => {
      toast.loading("Updating purchase item...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Purchase item updated successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update purchase item", {
        id: toastId
      });
    }
  });

  return mutation;
};
