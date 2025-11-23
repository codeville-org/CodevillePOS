import { useElectronAPI } from "@/hooks/use-electron-api";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { useQuery } from "@tanstack/react-query";

export const useGetCashflowBalance = () => {
  const { setActiveBalance } = useCashflow();

  const query = useQuery({
    queryKey: ["cashflow"],
    queryFn: async () => {
      const api = useElectronAPI();

      const response = await api.cashflow.getBalance();

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to get cashflow balance");
      }

      setActiveBalance(response.data);

      return response.data;
    }
  });

  return query;
};
