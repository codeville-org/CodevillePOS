import { useElectronAPI } from "@/hooks/use-electron-api";
import { UpdatePurchaseWithPaymentSchema } from "@/lib/zod/supplier.zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";

interface MutationPayload {
  id: string;
  input: UpdatePurchaseWithPaymentSchema;
}

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (payload: MutationPayload) => {
      const api = useElectronAPI();

      const response = await api.purchase.update(payload.id, payload.input);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to update purchase");
      }

      return response.data;
    },
    onMutate: () => {
      toast.loading("Updating purchase...", { id: toastId });
    },
    onSuccess: (_, variables) => {
      toast.success("Purchase updated successfully!", { id: toastId });

      // ✅ OPTIMIZED: Specific invalidations
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({
        queryKey: ["purchases", "detail", { id: variables.id }]
      });

      // ✅ OPTIMIZED: If payment was made, invalidate cash drawer and payment history
      if (variables.input.paidAmount !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["cashflow"] });
        queryClient.invalidateQueries({
          queryKey: ["purchases", "payment-history", { id: variables.id }]
        });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update purchase", {
        id: toastId
      });
    }
  });

  return mutation;
};
