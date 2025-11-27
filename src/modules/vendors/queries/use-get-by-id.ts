import { useElectronAPI } from "@/hooks/use-electron-api";
import { useQuery } from "@tanstack/react-query";

export const useGetVendorById = (id: string) => {
  const query = useQuery({
    queryKey: ["vendors", { id }],
    queryFn: async () => {
      const api = useElectronAPI();

      const response = await api.vendor.getById(id);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to fetch vendor");
      }

      return response.data;
    }
  });

  return query;
};
