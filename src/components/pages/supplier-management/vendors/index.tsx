import PageContainer from "@/components/layouts/dashboard/page-container";
import { AppPageShell } from "@/components/layouts/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TEXTS } from "@/lib/language";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { CreateVendorDialog } from "@/modules/vendors/components/create";
import VendorsTable from "@/modules/vendors/components/listing";
import { VendorTableActions } from "@/modules/vendors/components/vendors-table/vendors-table-actions";
import { PlusCircleIcon } from "lucide-react";

type Props = {};

export function VendorsPage({}: Props) {
  const { language } = usePersistStore();

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-col w-full h-full gap-2">
        <AppPageShell
          title={TEXTS.supplierManagement.vendors.title[language]}
          description={TEXTS.supplierManagement.vendors.subtitle[language]}
          actionComponent={
            <CreateVendorDialog>
              <Button icon={<PlusCircleIcon />}>Add new Vendor</Button>
            </CreateVendorDialog>
          }
        />

        <Separator />

        <VendorTableActions />

        <VendorsTable />
      </div>
    </PageContainer>
  );
}
