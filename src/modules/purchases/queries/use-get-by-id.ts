import { useElectronAPI } from "@/hooks/use-electron-api";
import { useQuery } from "@tanstack/react-query";

// ✅ FIXED: Correct function name
export const useGetPurchaseById = (id: string) => {
  const query = useQuery({
    queryKey: ["purchases", "detail", { id }], // ✅ OPTIMIZED: More specific key
    queryFn: async () => {
      const api = useElectronAPI();

      const response = await api.purchase.getById(id);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to fetch purchase");
      }

      return response.data;
    },
    enabled: !!id, // ✅ OPTIMIZED: Only run when id exists
    staleTime: 1000 * 60 * 5 // ✅ OPTIMIZED: Cache for 5 minutes
  });

  return query;
};
