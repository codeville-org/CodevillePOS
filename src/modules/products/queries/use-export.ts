import { useMutation } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";

import { useElectronAPI } from "@/hooks/use-electron-api";

export const useExportProducts = () => {
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async () => {
      const api = useElectronAPI();

      const response = await api.products.export();

      if (!response.success || response.error) {
        throw new Error(response.error || "Failed to export products");
      }

      return response;
    },
    onMutate: () => {
      toast.loading("Exporting products to CSV...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Products exported successfully!", { id: toastId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to export products", {
        id: toastId
      });
    }
  });

  return mutation;
};
