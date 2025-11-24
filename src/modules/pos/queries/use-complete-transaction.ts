import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";

import { useElectronAPI } from "@/hooks/use-electron-api";
import { PaymentMethod } from "@/lib/zod/transactions.zod";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { usePosStore } from "@/lib/zustand/pos-store";
import { usePrinterStore } from "@/lib/zustand/printer-store";
import { useSecurityStore } from "@/lib/zustand/security-store";

export const useCompleteTransaction = () => {
  const { setActiveBalance } = useCashflow();
  const queryClient = useQueryClient();
  const toastId = useId();
  const {
    activeTransaction,
    transactionItems,
    setActiveTransaction,
    clearTransactionItems
  } = usePosStore();
  const { user } = useSecurityStore();

  const { setCurrentItem, setPrinterModalOpen } = usePrinterStore();

  const mutation = useMutation({
    mutationFn: async () => {
      const api = useElectronAPI();

      const addedItems = await api.transactions.addItems(
        activeTransaction.id,
        transactionItems
      );

      if (!addedItems.success) {
        throw new Error(addedItems.error || "Failed to add transaction items");
      }

      const updatedTransaction = await api.transactions.update(
        activeTransaction.id,
        activeTransaction
      );

      if (!updatedTransaction.success) {
        throw new Error(
          updatedTransaction.error || "Failed to update transaction"
        );
      }

      // If Cash Payment, update cash drawer balance
      if (activeTransaction.paymentMethod === PaymentMethod.CASH) {
        const cashDrawerBalanceResponse = await api.cashflow.getBalance();

        if (
          !cashDrawerBalanceResponse.success ||
          !cashDrawerBalanceResponse.data
        ) {
          toast.warning("Failed to retrieve cash drawer balance");

          return;
        }

        // Create cash-in event for cash received
        const cashInEvent = await api.cashflow.createEvent({
          eventType: "cash_in",
          totalAmount: activeTransaction.cashReceived,
          userId: user.id,
          transactionId: activeTransaction.id
        });

        // Create cash-out event for change given
        const cashOutEvent = await api.cashflow.createEvent({
          eventType: "cash_out",
          totalAmount: activeTransaction.changeGiven,
          userId: user.id,
          transactionId: activeTransaction.id
        });

        const currentBalance = cashDrawerBalanceResponse.data.totalAmount;
        let newBalance = currentBalance - activeTransaction.changeGiven;
        newBalance += activeTransaction.cashReceived;

        const updatedBalance = await api.cashflow.updateBalance({
          totalAmount: newBalance,
          lastEventId: cashOutEvent?.data?.id || cashInEvent?.data?.id,
          lastUpdatedBy: user.id
        });

        if (updatedBalance.success && updatedBalance?.data) {
          setActiveBalance(updatedBalance.data);

          toast.success("Cash drawer balance updated successfully");
        }
      }

      // If Customer is selected & Payment method is credit,
      // Update customer balance
      if (
        activeTransaction.customerId &&
        activeTransaction.paymentMethod === PaymentMethod.LEND
      ) {
        const currentCustomer = await api.customers.getById(
          activeTransaction.customerId
        );

        if (currentCustomer.data) {
          const updatedCustomer = await api.customers.update(
            activeTransaction.customerId,
            {
              currentBalance:
                currentCustomer.data.currentBalance +
                activeTransaction.totalAmount
            }
          );

          if (!updatedCustomer.success) {
            toast.warning("Failed to update customer balance");
          }
        }
      }

      // Update stock quantities
      // Promise all stock updates
      await Promise.all(
        transactionItems.map(async (item) => {
          const product = await api.products.getById(item.productId);

          const newStockQuantity = product.data.stockQuantity - item.quantity;

          await api.products.update(item.productId, {
            stockQuantity: newStockQuantity
          });
        })
      );

      return updatedTransaction.data;
    },
    onMutate: () => {
      toast.loading("Completing Transaction...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Transaction Completed Successfully!", { id: toastId });

      //   Execute bill printing mechanism
      setCurrentItem({ transactionId: activeTransaction.id });
      setPrinterModalOpen(true);

      // Clear active transaction
      // Todo: Move these to printer modal if needed
      setActiveTransaction(null);
      clearTransactionItems();

      queryClient.invalidateQueries({ queryKey: ["transactions", "products"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete transaction", {
        id: toastId
      });
    }
  });

  return mutation;
};
