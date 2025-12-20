import { useElectronAPI } from "@/hooks/use-electron-api";
import { UpdateVendorSchema } from "@/lib/zod/supplier.zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const useUpdateVendor = (id: string) => {
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (values: UpdateVendorSchema) => {
      const api = useElectronAPI();

      const response = await api.vendor.update(id, values);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to update vendor");
      }

      const data = response.data;

      return data;
    },
    onMutate: () => {
      toast.loading("Updating vendor...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Vendor updated successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update vendor", {
        id: toastId
      });
    }
  });

  return mutation;
};
