import { useElectronAPI } from "@/hooks/use-electron-api";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { useSecurityStore } from "@/lib/zustand/security-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

export const useStartShift = () => {
  const { setActiveShift } = useCashflow();
  const { user } = useSecurityStore();
  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async () => {
      const api = useElectronAPI();

      if (!user) throw new Error("User not authenticated");

      const response = await api.cashflow.startShift(user.id);

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to initialize balance");
      }

      const data = response.data;

      setActiveShift(data);

      return data;
    },
    onMutate: () => {
      toast.loading("Starting Work Shift...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Work Shift initialized successfully!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["cashflow"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to initialize shift", {
        id: toastId
      });
    }
  });

  return mutation;
};
