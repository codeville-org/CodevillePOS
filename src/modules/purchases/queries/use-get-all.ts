import { useElectronAPI } from "@/hooks/use-electron-api";
import { GetAllPurchasesQuerySchema } from "@/lib/zod/supplier.zod";
import { useQuery } from "@tanstack/react-query";

export const useGetAllPurchases = (queryParams: GetAllPurchasesQuerySchema) => {
  const query = useQuery({
    queryKey: ["purchases", "list", { ...queryParams }],
    queryFn: async () => {
      const api = useElectronAPI();

      const response = await api.purchase.getAll(queryParams);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to fetch purchases");
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData
  });

  return query;
};
