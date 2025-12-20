import { useElectronAPI } from "@/hooks/use-electron-api";
import { QueryParamsSchema } from "@/lib/zod/helpers";
import { useQuery } from "@tanstack/react-query";

export const useGetAllShifts = (params: QueryParamsSchema) => {
  const query = useQuery({
    queryKey: ["cashflow", "shifts", { ...params }],
    queryFn: async () => {
      const api = useElectronAPI();

      const { page = "1", limit = "10", search = "", sort = "desc" } = params;

      const response = await api.cashflow.getAllShifts({
        page,
        limit,
        search,
        sort
      });

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to get cashflow shifts");
      }

      return response.data;
    }
  });

  return query;
};
