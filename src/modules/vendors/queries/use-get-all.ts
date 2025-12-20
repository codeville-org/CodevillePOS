import { useElectronAPI } from "@/hooks/use-electron-api";
import { QueryParamsSchema } from "@/lib/zod/helpers";
import { useQuery } from "@tanstack/react-query";

export const useGetAllVendors = (queryParams: QueryParamsSchema) => {
  const query = useQuery({
    queryKey: ["vendors", { ...queryParams }],
    queryFn: async () => {
      const {
        page = "1",
        limit = "10",
        search = "",
        sort = "desc"
      } = queryParams;

      const api = useElectronAPI();

      const response = await api.vendor.getAll({
        page,
        limit,
        search,
        sort
      });

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to fetch vendors");
      }

      return response.data;
    }
  });

  return query;
};
