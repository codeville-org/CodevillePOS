import { useElectronAPI } from "@/hooks/use-electron-api";
import { AddPurchaseItemSchema } from "@/lib/zod/supplier.zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const usePurchaseAddItem = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (input: AddPurchaseItemSchema) => {
      const api = useElectronAPI();

      const response = await api.purchase.addItem(input);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to create new purchase item");
      }

      const data = response.data;
      return data;
    },
    onMutate: () => {
      toast.loading("Adding new item...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("New item added successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add new item", {
        id: toastId
      });
    }
  });

  return mutation;
};
