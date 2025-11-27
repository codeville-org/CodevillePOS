import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectPurchaseSchema } from "@/lib/zod/supplier.zod";
import { useSecurityStore } from "@/lib/zustand/security-store";
import { CheckCircleIcon, PackagePlusIcon, RefreshCwIcon } from "lucide-react";
import { useUpdatePurchase } from "../queries/use-update";
import { useUpdateStock } from "../queries/use-update-stock";
import { AddNewPurchaseItemDialog } from "./add-purchase-item";

type Props = {
  purchase: SelectPurchaseSchema;
};

export function PurchaseActions({ purchase }: Props) {
  const { user } = useSecurityStore();
  const [status, setStatus] = useState<SelectPurchaseSchema["status"]>(
    purchase.status
  );
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>("");
  const [paymentDescription, setPaymentDescription] = useState<string>("");

  const { mutate, isPending } = useUpdatePurchase();
  const { mutate: updateStock, isPending: updatingStock } = useUpdateStock();

  useEffect(() => {
    if (purchase) {
      setStatus(purchase.status);
    }
  }, [purchase]);

  const handlePay = () => {
    const payAmountNum = parseFloat(payAmount);

    // Validate inputs
    if (isNaN(payAmountNum) || payAmountNum <= 0) {
      return;
    }

    mutate(
      {
        id: purchase.id,
        input: {
          paidAmount: payAmountNum,
          userId: user?.id || ""
        }
      },
      {
        onSuccess: () => {
          setPaymentDialogOpen(false);
        }
      }
    );
  };

  const handleComplete = () => {
    mutate({
      id: purchase.id,
      input: {
        status: "completed",
        userId: user?.id || ""
      }
    });
  };

  const handleUpdateStock = () => {
    updateStock(purchase.id);
  };

  return (
    <div className="min-h-16 flex items-center justify-between gap-4 py-2 px-2 w-full border-y border-secondary/50 bg-primary/5 dark:bg-sidebar/50">
      <div className="flex items-center gap-4">
        <AddNewPurchaseItemDialog purchaseId={purchase.id}>
          <Button className="h-14 text-base" icon={<PackagePlusIcon />}>
            Add new Item
          </Button>
        </AddNewPurchaseItemDialog>

        <div className="h-14 flex items-center w-fit border border-foreground/20 bg-background rounded-md p-2">
          <input
            placeholder="Pay amount"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            className="flex-1 text-lg text-foreground h-full"
          />

          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <form>
              <DialogTrigger asChild>
                <Button
                  loading={isPending}
                  className="bg-blue-700 hover:bg-blue-600 h-full text-lg font-semibold text-white hover:text-white"
                >
                  Pay
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Pay Purchase</DialogTitle>
                  <DialogDescription>
                    Leave a descriptive note for this payment.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" onClick={handlePay} loading={isPending}>
                    Pay Now
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {status === "active" && (
          <Button
            icon={<CheckCircleIcon />}
            onClick={handleComplete}
            loading={isPending}
            className="bg-amber-500 hover:bg-amber-600 h-14 text-base font-semibold text-amber-50 hover:text-amber-50"
          >
            Complete Purchase
          </Button>
        )}
        {status === "completed" && (
          <Button
            icon={<RefreshCwIcon />}
            onClick={handleUpdateStock}
            loading={updatingStock}
            className="bg-purple-500 hover:bg-purple-600 h-14 text-base font-semibold text-purple-50 hover:text-purple-50"
          >
            Update Stock
          </Button>
        )}
      </div>
    </div>
  );
}
