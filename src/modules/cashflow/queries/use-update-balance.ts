import { useElectronAPI } from "@/hooks/use-electron-api";
import { UpdateCashDrawerBalance } from "@/lib/zod/cashflow.zod";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const useUpdateBalance = () => {
  const { setActiveBalance } = useCashflow();
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (value: UpdateCashDrawerBalance) => {
      const api = useElectronAPI();

      const response = await api.cashflow.updateBalance(value);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to update drawer balance");
      }

      const data = response.data;

      setActiveBalance(data);

      return data;
    },
    onMutate: () => {
      toast.loading("Updating Balance...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Balance updated successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["cashflow"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update balance", {
        id: toastId
      });
    }
  });

  return mutation;
};
