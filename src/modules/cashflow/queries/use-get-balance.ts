import { useElectronAPI } from "@/hooks/use-electron-api";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { useQuery } from "@tanstack/react-query";

export const useGetCashflowBalance = () => {
  const { setActiveBalance, resetCashflowState } = useCashflow();

  const query = useQuery({
    queryKey: ["cashflow", "balance"],
    queryFn: async () => {
      const api = useElectronAPI();

      try {
        const response = await api.cashflow.getBalance();

        // If API returns error, reset state and throw
        if (!response.success || response.error) {
          console.log("Balance API error, resetting cashflow state...");
          resetCashflowState();
          throw new Error(response.error || "Failed to get cashflow balance");
        }

        // If no data, reset state and throw
        if (!response?.data) {
          console.log("No balance data, resetting cashflow state...");
          resetCashflowState();
          throw new Error("No balance data received");
        }

        // Success - update active balance
        setActiveBalance(response.data);
        return response.data;
      } catch (error) {
        // On any error, reset the cashflow state
        console.error("Balance fetch error:", error);
        resetCashflowState();
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Retry up to 2 times, but not for certain errors
      if (failureCount >= 2) return false;

      // Don't retry if it's a data structure issue
      if (error.message?.includes("No balance data")) return false;

      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0 // Don't cache failed queries
  });

  return query;
};
