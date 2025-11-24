import { useElectronAPI } from "@/hooks/use-electron-api";
import { InsertCashDrawerEvent } from "@/lib/zod/cashflow.zod";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { useSecurityStore } from "@/lib/zustand/security-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useId } from "react";
import { toast } from "sonner";

function getToastMessages(eventType: InsertCashDrawerEvent["eventType"]) {
  const messages: Record<
    InsertCashDrawerEvent["eventType"],
    { loading: string; success: string; error: string }
  > = {
    opening_balance: {
      loading: "Setting opening balance...",
      success: "Opening balance set successfully!",
      error: "Failed to set opening balance"
    },
    cash_in: {
      loading: "Processing cash-in...",
      success: "Cash-in processed successfully!",
      error: "Failed to process cash-in"
    },
    cash_out: {
      loading: "Processing cash-out...",
      success: "Cash-out processed successfully!",
      error: "Failed to process cash-out"
    },
    manual_add: {
      loading: "Adding cash...",
      success: "Cash added successfully!",
      error: "Failed to add cash"
    },
    manual_remove: {
      loading: "Removing cash...",
      success: "Cash removed successfully!",
      error: "Failed to remove cash"
    },
    shift_end: {
      loading: "Ending work shift...",
      success: "Work shift ended successfully!",
      error: "Failed to end shift"
    },
    correction: {
      loading: "Applying correction...",
      success: "Correction applied successfully!",
      error: "Failed to apply correction"
    }
  };

  return messages[eventType];
}

export const useCreateEvent = () => {
  const { user } = useSecurityStore();
  const { setActiveBalance } = useCashflow();
  const api = useElectronAPI();

  const queryClient = useQueryClient();
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (values: InsertCashDrawerEvent) => {
      if (!user) throw new Error("User not authenticated");

      const response = await api.cashflow.createEvent({
        ...values,
        userId: user.id
      });

      if (!response.data || response.error) {
        throw new Error(response.error || "Failed to create event");
      }

      // If successful,
      // Update the cashflow balance
      if (
        response.data.eventType === "manual_add" ||
        response.data.eventType === "manual_remove" ||
        response.data.eventType === "correction"
        // Cash-in / cash-out are handled in their own mutations
      ) {
        const currentBalance = await api.cashflow.getBalance();

        let newBalance;

        if (response.data.eventType === "manual_add") {
          newBalance =
            currentBalance.data.totalAmount + response.data.totalAmount;
        } else if (response.data.eventType === "manual_remove") {
          newBalance =
            currentBalance.data.totalAmount - response.data.totalAmount;
        } else if (response.data.eventType === "correction") {
          newBalance = response.data.newBalance;
        }

        const updatedRes = await api.cashflow.updateBalance({
          lastEventId: response.data.id,
          totalAmount: newBalance,
          lastUpdatedBy: user.id
        });

        if (updatedRes.data && updatedRes.success) {
          setActiveBalance(updatedRes.data);
        }
      }

      const data = response.data;

      return data;
    },
    onMutate: (variables) => {
      toast.loading(getToastMessages(variables.eventType).loading, {
        id: toastId
      });
    },
    onSuccess: (variables) => {
      toast.success(getToastMessages(variables.eventType).success, {
        id: toastId
      });
      queryClient.invalidateQueries({ queryKey: ["cashflow"] });
    },
    onError: (error, variables) => {
      toast.error(
        getToastMessages(variables.eventType).error || error.message,
        {
          id: toastId
        }
      );
    }
  });

  return mutation;
};
