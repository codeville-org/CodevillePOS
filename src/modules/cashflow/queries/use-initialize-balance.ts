import { useElectronAPI } from "@/hooks/use-electron-api";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const useInitializeBalance = () => {
  const { setActiveBalance } = useCashflow();
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async () => {
      const api = useElectronAPI();

      const response = await api.cashflow.initializeBalance();

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to initialize balance");
      }

      const data = response.data;

      setActiveBalance(data);

      return data;
    },
    onMutate: () => {
      //   toast.loading("Initializing Balance...", { id: toastId });
    },
    onSuccess: () => {
      //   toast.success("Balance initialized successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["cashflow"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to initialize balance", {
        id: toastId
      });
    }
  });

  return mutation;
};
