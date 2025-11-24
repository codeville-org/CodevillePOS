import { Button } from "@/components/ui/button";
import {
  BanknoteArrowDownIcon,
  BanknoteArrowUpIcon,
  Settings2Icon
} from "lucide-react";
import { CashflowModal } from "./cashflow-modal";
import { ManualCashAddDialog } from "./manual-cash-add";
import { ManualCashRemoveDialog } from "./manual-cash-remove";

type Props = {};

export function CashflowTabBar({}: Props) {
  return (
    <div className="min-h-12 flex items-center gap-2 py-2 px-2 w-full border-y border-secondary/50 bg-primary/5">
      <CashflowModal>
        <Button
          variant="default"
          icon={<Settings2Icon />}
          className="shadow-none"
        >
          Manage Cashdrawer
        </Button>
      </CashflowModal>

      <ManualCashAddDialog>
        <Button
          icon={<BanknoteArrowDownIcon />}
          variant="secondary"
          className="shadow-none bg-primary/0 dark:bg-primary/10 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary border border-primary"
        >
          Add Cash
        </Button>
      </ManualCashAddDialog>

      <ManualCashRemoveDialog>
        <Button
          icon={<BanknoteArrowUpIcon />}
          variant="secondary"
          className="shadow-none bg-primary/0 dark:bg-primary/10 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary border border-primary"
        >
          Remove Cash
        </Button>
      </ManualCashRemoveDialog>
    </div>
  );
}
