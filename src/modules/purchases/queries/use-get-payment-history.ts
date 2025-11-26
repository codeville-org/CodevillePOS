import { useElectronAPI } from "@/hooks/use-electron-api";
import { useQuery } from "@tanstack/react-query";

export const useGetPaymentHistory = (id: string) => {
  const query = useQuery({
    queryKey: ["purchases", "payment-history", { id }],
    queryFn: async () => {
      const api = useElectronAPI();

      const response = await api.purchase.history(id);

      if (!response.data || response.error) {
        throw new Error(
          response.error || "Failed to fetch purchase payment history"
        );
      }

      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 30
  });

  return query;
};
