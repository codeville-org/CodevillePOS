import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { useEffect } from "react";

import { TEXTS } from "@/lib/language";
import { cn, formatPrice } from "@/lib/utils";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { usePosStore } from "@/lib/zustand/pos-store";
import { useSecurityStore } from "@/lib/zustand/security-store";
import { LogoutBadge } from "@/modules/auth/logout-badge";
import { CashflowModal } from "@/modules/cashflow/components/cashflow-modal";
import { useGetCashflowBalance } from "@/modules/cashflow/queries/use-get-balance";
import { useInitializeBalance } from "@/modules/cashflow/queries/use-initialize-balance";
import { RealtimeClock } from "@/modules/pos/components/clock";
import { HoldQueue } from "@/modules/pos/components/hold-queue";
import { useGetSettings } from "@/modules/settings/query/use-get";
import { CircleDollarSignIcon, Loader2 } from "lucide-react";
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
  const { holdQueue } = usePosStore();

  const { activeBalance, getActiveShift, fetchingActiveShift, activeShift } =
    useCashflow();
  const { mutate: initializeBalance, isPending: balanceInitializing } =
    useInitializeBalance();
  const { isPending: balanceLoading, error: balanceError } =
    useGetCashflowBalance();

  // Update persisted store settings from database
  useEffect(() => {
    if (data && !error) {
      setStoreSettings({ ...data });
      setAvailablePaymentMethods(data.availablePaymentMethods || []);
      setImagesEnabled(data.imagesEnabled ?? true);
    }
  }, [data, error]);

  // Initialize balance only on mount or error
  useEffect(() => {
    const shouldInitialize =
      !activeBalance && // No active balance
      !balanceLoading && // Not currently loading
      !balanceInitializing && // Not currently initializing
      !fetchingActiveShift; // Not fetching shift

    if (shouldInitialize || balanceError) {
      console.log("Initializing balance...", {
        shouldInitialize,
        balanceError: !!balanceError
      });

      initializeBalance(undefined, {
        onSuccess: () => {
          getActiveShift();
        }
      });
    }
  }, [balanceError]); // Only re-run on balance error changes

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
                <div className="flex-1 flex items-center gap-2 h-full">
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

                  {holdQueue.length > 0 && (
                    <>
                      <Separator
                        className="mx-2 ml-4 data-[orientation=vertical]:h-4"
                        orientation="vertical"
                      />

                      <HoldQueue>
                        <div className="text-xs flex items-center gap-2 cursor-pointer hover:underline text-red-500 bg-red-500/10 p-1 px-3 border border-red-500 rounded-full animate-pulse">
                          {language === "en" && (
                            <p>
                              {holdQueue.length} Sale
                              {holdQueue.length > 1 ? "s" : ""} on Queue
                            </p>
                          )}

                          {language === "si" && (
                            <p>
                              {"ගණුදෙනු"} {holdQueue.length}
                              {`ක් රදවාගෙන ඇත`}
                            </p>
                          )}
                        </div>
                      </HoldQueue>
                    </>
                  )}
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
                    ) : fetchingActiveShift ? (
                      <p className="text-xs flex items-center gap-2 text-foreground/60">
                        <Loader2 className="animate-spin size-3" />
                        Getting Shift...
                      </p>
                    ) : (
                      <CashflowModal>
                        <div className="text-xs flex items-center gap-2 cursor-pointer hover:underline">
                          <div
                            className={cn("size-2 rounded-full", {
                              "bg-amber-500": activeShift === null,
                              "bg-green-600": activeShift
                            })}
                          />

                          {activeShift ? (
                            <p className={"text-green-600"}>
                              {TEXTS.header.shift.ongoing[language]}
                            </p>
                          ) : (
                            <p className={"text-amber-500"}>
                              {TEXTS.header.shift.inactive[language]}
                            </p>
                          )}

                          {activeShift && activeBalance && (
                            <div className="ml-3 flex items-center gap-2 text-green-500">
                              <CircleDollarSignIcon className="size-3" />
                              {formatPrice(activeBalance.totalAmount, language)}
                            </div>
                          )}
                        </div>
                      </CashflowModal>
                    )}
                  </div>

                  <Separator
                    className="mx-2 ml-4 data-[orientation=vertical]:h-4"
                    orientation="vertical"
                  />

                  <div className="flex items-center gap-3">
                    {user && (
                      <p className="text-xs text-secondary-foreground/70">
                        {TEXTS.header.hello[language]}, {user.username}
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
