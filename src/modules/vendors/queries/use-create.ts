import { useElectronAPI } from "@/hooks/use-electron-api";
import { InsertVendorSchema } from "@/lib/zod/supplier.zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (values: InsertVendorSchema) => {
      const api = useElectronAPI();

      const response = await api.vendor.create(values);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to initialize balance");
      }

      const data = response.data;

      return data;
    },
    onMutate: () => {
      toast.loading("Creating vendor...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Vendor created successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create vendor", {
        id: toastId
      });
    }
  });

  return mutation;
};
