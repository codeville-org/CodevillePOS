import { useElectronAPI } from "@/hooks/use-electron-api";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { useQuery } from "@tanstack/react-query";

export const useGetShiftEvents = () => {
  const { activeListingShift } = useCashflow();

  const query = useQuery({
    queryKey: ["cashflow", "shifts", "events", { activeListingShift }],
    queryFn: async () => {
      const api = useElectronAPI();

      if (!activeListingShift) return;

      const response = await api.cashflow.getShiftEvents({
        startedAt: activeListingShift.startedAt,
        endedAt: activeListingShift?.endedAt
      });

      console.log(response);

      if (!response.data || response.error) {
        throw new Error(
          response.error || "Failed to get cashflow shift events"
        );
      }

      return response.data;
    }
  });

  return query;
};
