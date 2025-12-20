import { useElectronAPI } from "@/hooks/use-electron-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";

// ✅ FIXED: Correct function name
export const useDeletePurchaseItem = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const api = useElectronAPI();

      const response = await api.purchase.deleteItem(id);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to delete purchase item");
      }

      const data = response.data;
      return data;
    },
    onMutate: () => {
      toast.loading("Deleting purchase item...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Purchase item deleted successfully!", { id: toastId });

      // ✅ OPTIMIZED: More specific invalidation
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Stock might have changed
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete purchase item", {
        id: toastId
      });
    }
  });

  return mutation;
};
