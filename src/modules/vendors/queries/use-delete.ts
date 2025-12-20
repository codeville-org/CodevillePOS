import { useElectronAPI } from "@/hooks/use-electron-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const api = useElectronAPI();

      const response = await api.vendor.delete(id);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to delete vendor");
      }

      const data = response.data;

      return data;
    },
    onMutate: () => {
      toast.loading("Deleting vendor...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Vendor deleted successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete vendor", {
        id: toastId
      });
    }
  });

  return mutation;
};
