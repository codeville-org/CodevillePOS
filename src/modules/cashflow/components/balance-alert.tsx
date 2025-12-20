import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { AlertCircleIcon, BanknoteArrowUpIcon } from "lucide-react";
import { CashflowModal } from "./cashflow-modal";

export function BalanceAlert() {
  return (
    <div className="rounded-md border border-destructive bg-destructive/10 p-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircleIcon className="size-4 text-destructive dark:text-red-500" />
        <p className="text-sm text-destructive dark:text-red-500 font-medium">
          Cash drawer balance is {formatPrice(0)}, Please Update with Current
          Amount
        </p>
      </div>

      <CashflowModal>
        <Button variant="destructive" icon={<BanknoteArrowUpIcon />}>
          Update Cash Drawer
        </Button>
      </CashflowModal>
    </div>
  );
}
