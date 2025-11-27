import PageContainer from "@/components/layouts/dashboard/page-container";
import { AppPageShell } from "@/components/layouts/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TEXTS } from "@/lib/language";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { CreateNewPurchase } from "@/modules/purchases/components/create";
import PurchasesTable from "@/modules/purchases/components/listing";
import { PurchasesTableActions } from "@/modules/purchases/components/purchases-table/purchases-table-actions";
import { PlusCircleIcon } from "lucide-react";

type Props = {};

export function PurchasesPage({}: Props) {
  const { language } = usePersistStore();

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-col w-full h-full gap-2">
        <AppPageShell
          title={TEXTS.supplierManagement.purchases.title[language]}
          description={TEXTS.supplierManagement.purchases.subtitle[language]}
          actionComponent={
            <CreateNewPurchase>
              <Button icon={<PlusCircleIcon />}>Add new Purchase</Button>
            </CreateNewPurchase>
          }
        />

        <Separator />

        <PurchasesTableActions />

        <PurchasesTable />
      </div>
    </PageContainer>
  );
}
