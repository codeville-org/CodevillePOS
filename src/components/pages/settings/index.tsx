import PageContainer from "@/components/layouts/dashboard/page-container";
import { AppPageShell } from "@/components/layouts/dashboard/page-shell";
import { Separator } from "@/components/ui/separator";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { PasswordSection } from "@/modules/settings/components/password-section";
import { PaymentMethodsManagement } from "@/modules/settings/components/payment-methods";
import { PrinterManagement } from "@/modules/settings/components/printer-management";
import { StoreSettings } from "@/modules/settings/components/store-settings";
import { SystemReset } from "@/modules/settings/components/system-reset";

type Props = {};

export function SettingsPage({}: Props) {
  const {} = usePersistStore();

  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-col w-full h-full gap-8">
        <AppPageShell
          title={"Settings"}
          description={"Manage your application settings"}
          actionComponent={undefined}
        />

        <Separator />

        <StoreSettings />

        <PasswordSection />

        <PaymentMethodsManagement />

        <PrinterManagement />

        <SystemReset />

        {/* NOTE: Uncomment only for debug purposes */}
        {/* <PrinterManager /> */}
        <div className="pb-5" />
      </div>
    </PageContainer>
  );
}
