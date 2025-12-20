import { useElectronAPI } from "@/hooks/use-electron-api";
import { AnalyticsQueryParamsSchema } from "@/lib/zod/reports.zod";
import { useQuery } from "@tanstack/react-query";

export const useGetReportsAnalytics = (params?: AnalyticsQueryParamsSchema) => {
  const query = useQuery({
    queryKey: ["reports", "analytics", params],
    queryFn: async () => {
      const api = useElectronAPI();

      const response = await api.reports.getAnalytics(params);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to fetch analytics");
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for more frequent updates
    refetchOnWindowFocus: true
  });

  return query;
};
