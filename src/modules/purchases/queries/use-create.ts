import { useElectronAPI } from "@/hooks/use-electron-api";
import { CreatePurchaseSchema } from "@/lib/zod/supplier.zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (values: CreatePurchaseSchema) => {
      const api = useElectronAPI();

      const response = await api.purchase.create(values);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to create customer");
      }

      const data = response.data;
      return data;
    },
    onMutate: () => {
      toast.loading("Creating new purchase...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("New purchase created successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create purchase", {
        id: toastId
      });
    }
  });

  return mutation;
};
