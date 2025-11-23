import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { useEffect } from "react";

import { cn } from "@/lib/utils";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { useSecurityStore } from "@/lib/zustand/security-store";
import { LogoutBadge } from "@/modules/auth/logout-badge";
import { useGetCashflowBalance } from "@/modules/cashflow/queries/use-get-balance";
import { useInitializeBalance } from "@/modules/cashflow/queries/use-initialize-balance";
import { RealtimeClock } from "@/modules/pos/components/clock";
import { useGetSettings } from "@/modules/settings/query/use-get";
import { Loader2 } from "lucide-react";
import { LanguageSelector } from "../elements/language-selector";
import { AppSidebar } from "./dashboard/app-sidebar";
import { WindowActions } from "./dashboard/window-actions";
import { AppRouter } from "./router";

export function Wrapper() {
  const { data, error } = useGetSettings();
  const {
    language,
    setStoreSettings,
    setAvailablePaymentMethods,
    setImagesEnabled
  } = usePersistStore();
  const { user } = useSecurityStore();

  const { activeBalance } = useCashflow();
  const { mutate: initializeBalance, isPending: balanceInitializing } =
    useInitializeBalance();

  const { isPending: balanceLoading } = useGetCashflowBalance();

  // Update persisted store settings from database
  useEffect(() => {
    if (data && !error) {
      setStoreSettings({ ...data });
      setAvailablePaymentMethods(data.availablePaymentMethods || []);
      setImagesEnabled(data.imagesEnabled ?? true);
    }
  }, [data, error]);

  // Validate cash drawer balance status
  useEffect(() => {
    handleInitializeBalance();
  }, [activeBalance]);

  const handleInitializeBalance = () => {
    if (!activeBalance) {
      initializeBalance();
    }
  };

  return (
    <main
      className={cn(
        "min-h-screen w-screen overflow-hidden",
        language === "si" && "font-sinhala"
      )}
    >
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />

        <SidebarInset>
          <header className="flex h-10 border-b shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center h-full w-full gap-2 px-4">
              <SidebarTrigger className="-ml-1" />

              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />

              <div className="h-full w-full flex items-center justify-between">
                {/* NOTE: Add "app-dragger" if dragging feature needed */}
                <div className="flex-1 ">
                  <h2 className="font-semibold text-foreground/80 text-sm">
                    <span
                      className={
                        cn("font-semibold mr-0.5")
                        // language === "si" ? "font-sinhala text-xs" : "font-sans"
                      }
                    >
                      {`CodeVille`}
                    </span>
                    <span className="font-thin">POS</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2 h-full">
                  <div className="flex items-center gap-2">
                    {balanceInitializing ? (
                      <p className="text-xs flex items-center gap-2 text-foreground/60">
                        <Loader2 className="animate-spin size-3" />
                        Cash Flow is Getting Ready
                      </p>
                    ) : balanceLoading ? (
                      <p className="text-xs flex items-center gap-2 text-foreground/60">
                        <Loader2 className="animate-spin size-3" />
                        Balance is Loading...
                      </p>
                    ) : null}
                  </div>

                  <Separator
                    className="mx-2 ml-4 data-[orientation=vertical]:h-4"
                    orientation="vertical"
                  />

                  <div className="flex items-center gap-3">
                    {user && (
                      <p className="text-xs text-secondary-foreground/70">
                        Hello, {user.username}
                      </p>
                    )}
                    <LogoutBadge />
                  </div>

                  <Separator
                    className="mx-2 ml-4 data-[orientation=vertical]:h-4"
                    orientation="vertical"
                  />

                  <RealtimeClock />

                  <LanguageSelector />

                  <Separator
                    className="mx-2 data-[orientation=vertical]:h-4"
                    orientation="vertical"
                  />

                  <WindowActions />
                </div>
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col h-[calc(100vh-2.5rem)] overflow-hidden">
            <AppRouter />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
