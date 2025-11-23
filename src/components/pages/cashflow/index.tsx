import { Settings2Icon } from "lucide-react";

import PageContainer from "@/components/layouts/dashboard/page-container";
import { AppPageShell } from "@/components/layouts/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TEXTS } from "@/lib/language";
import { formatPrice } from "@/lib/utils";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { CashflowModal } from "@/modules/cashflow/components/cashflow-modal";

type Props = {};

export function CashflowPage({}: Props) {
  const { language } = usePersistStore();
  const { activeBalance } = useCashflow();

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-col w-full h-full gap-4">
        <AppPageShell
          title={TEXTS.cashflow.title[language]}
          description={TEXTS.cashflow.subtitle[language]}
          actionComponent={
            <div className="flex items-center gap-5">
              <div className="flex flex-col gap-0">
                <p className="text-xs text-foreground/80">Cashdrawer Total</p>
                <h2 className="text-lg font-semibold text-primary">
                  {formatPrice(activeBalance.totalAmount)}
                </h2>
              </div>

              <CashflowModal>
                <Button variant="default" icon={<Settings2Icon />}>
                  Manage Cashdrawer
                </Button>
              </CashflowModal>
            </div>
          }
        />

        <Separator />
      </div>
    </PageContainer>
  );
}
