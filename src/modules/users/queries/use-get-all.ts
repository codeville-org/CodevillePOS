import { useElectronAPI } from "@/hooks/use-electron-api";
import { QueryParamsSchema } from "@/lib/zod/helpers";
import { useQuery } from "@tanstack/react-query";

export const useGetAllUsers = (queryParams: QueryParamsSchema) => {
  const query = useQuery({
    queryKey: ["users", { ...queryParams }],
    queryFn: async () => {
      const {
        page = "1",
        limit = "10",
        search = "",
        sort = "desc"
      } = queryParams;

      const api = useElectronAPI();

      const response = await api.user.getAll({
        page,
        limit,
        search,
        sort
      });

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to fetch users");
      }

      return response.data;
    }
  });

  return query;
};
