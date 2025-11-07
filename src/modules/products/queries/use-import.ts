import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";

import { useElectronAPI } from "@/hooks/use-electron-api";
import { ImportProductsSchema } from "@/lib/zod/products.zod";

export const useImportProducts = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (payload: ImportProductsSchema) => {
      const api = useElectronAPI();

      const response = await api.products.import(payload);

      if (!response.success || response.error) {
        throw new Error(response.error || "Failed to import products");
      }

      return response;
    },
    onMutate: () => {
      toast.loading("Importing products from CSV...", { id: toastId });
    },
    onSuccess: (data) => {
      if (data.error) {
        // Import completed with warnings
        toast.warning(data.error, { id: toastId, duration: 8000 });
      } else {
        toast.success("Products imported successfully!", { id: toastId });
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to import products", {
        id: toastId,
        duration: 8000
      });
    }
  });

  return mutation;
};

export const useSelectImportFile = () => {
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async () => {
      const api = useElectronAPI();

      const response = await api.products.selectImportFile();

      if (!response.success || response.error) {
        throw new Error(response.error || "Failed to select file");
      }

      return response;
    },
    onMutate: () => {
      toast.loading("Opening file dialog...", { id: toastId });
    },
    onSuccess: () => {
      toast.dismiss(toastId);
    },
    onError: (error) => {
      // Only show error if it's not a user cancellation
      if (!error.message.includes("canceled")) {
        toast.error(error.message || "Failed to select file", {
          id: toastId
        });
      } else {
        toast.dismiss(toastId);
      }
    }
  });

  return mutation;
};
