import { useElectronAPI } from "@/hooks/use-electron-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      const api = useElectronAPI();

      const response = await api.purchase.updateStock(purchaseId);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to update stock");
      }

      return response.data;
    },
    onMutate: () => {
      toast.loading("Updating stock levels...", { id: toastId });
    },
    onSuccess: (data, purchaseId) => {
      // ✅ OPTIMIZED: Show detailed success message
      toast.success(data.message || "Stock updated successfully!", {
        id: toastId
      });

      // ✅ OPTIMIZED: Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({
        queryKey: ["purchases", "detail", { id: purchaseId }]
      });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Stock levels changed
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update stock", {
        id: toastId
      });
    }
  });

  return mutation;
};
