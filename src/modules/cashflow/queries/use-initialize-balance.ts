import { useElectronAPI } from "@/hooks/use-electron-api";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";

export const useInitializeBalance = () => {
  const { setActiveBalance, resetCashflowState } = useCashflow();
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async () => {
      const api = useElectronAPI();

      try {
        const response = await api.cashflow.initializeBalance();

        console.log({ initializeBalanceRes: response });

        if (!response.success || response.error || !response.data) {
          throw new Error(response.error || "Failed to initialize balance");
        }

        return response.data;
      } catch (error) {
        // Reset state on initialization failure
        resetCashflowState();
        throw error;
      }
    },
    onSuccess: (data) => {
      setActiveBalance(data);

      // Invalidate and refetch balance query
      queryClient.invalidateQueries({ queryKey: ["cashflow", "balance"] });

      console.log("Balance initialized successfully:", data);
    },
    onError: (error) => {
      console.error("Initialize balance error:", error);
      toast.error(error.message || "Failed to initialize balance", {
        id: toastId
      });

      // Reset state on error
      resetCashflowState();
    }
  });

  return mutation;
};
