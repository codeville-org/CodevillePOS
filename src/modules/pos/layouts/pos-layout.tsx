import { BarcodeReaderStatusBadge } from "@/components/elements/barcode-reader-status-badge";
import { PrinterStatusBadge } from "@/components/elements/printer-status-badge";
import { Separator } from "@/components/ui/separator";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { usePosStore } from "@/lib/zustand/pos-store";
import { BalanceAlert } from "@/modules/cashflow/components/balance-alert";
import ImageDisplay from "@/modules/image-manager/components/image-display";
import { BillingTable } from "../components/billing-table";
import { CategoriesBar } from "../components/categories-bar";
import { InitializeTransaction } from "../components/initialize-transaction";
import { ListingViewSwitcher } from "../components/listing-view-switcher";
import { PrinterProvider } from "../components/printer-provider";
import { ProductSearchInput } from "../components/product-search";
import { PosProductsListing } from "./pos-products-listing";
import { PosSidebar } from "./pos-sidebar";

type Props = {};

export function PosScreenLayout({}: Props) {
  const { storeSettings } = usePersistStore();
  const { listingView, activeTransaction } = usePosStore();
  const { activeBalance } = useCashflow();

  return (
    <div className="flex h-[calc(100vh-48px)] max-h-[calc(100vh-48px)] overflow-hidden">
      <PrinterProvider />

      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 pb-2 shadow-none space-y-3">
          <div className="flex items-center justify-between mb-6">
            {/* Store Name / Logo */}
            <div className={`flex items-center gap-2`}>
              {storeSettings.storeLogo ? (
                <ImageDisplay
                  filename={storeSettings.storeLogo}
                  className="h-10 object-cover"
                />
              ) : storeSettings.storeName ? (
                <h1 className="font-black font-sans text-primary text-2xl">
                  {storeSettings.storeName}
                </h1>
              ) : (
                <h1 className="font-black uppercase font-sans text-foreground text-2xl">
                  {`CodeVille POS`}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-3">
              <BarcodeReaderStatusBadge minimal />
              <PrinterStatusBadge minimal />
              {activeTransaction && <ListingViewSwitcher />}
              <InitializeTransaction />
            </div>
          </div>

          {/* Alert Compartment */}
          <div className="space-y-2">
            {activeBalance && activeBalance?.totalAmount < 1 && (
              <BalanceAlert />
            )}
          </div>

          <ProductSearchInput />
        </div>

        {listingView === "listing" && (
          <>
            {/* Categories Bar - Fixed */}
            <div className="flex-shrink-0">
              <CategoriesBar />
              <Separator className="opacity-50" />
            </div>

            {/* Products Listing - Scrollable */}
            <div className="flex-1 overflow-hidden">
              <PosProductsListing />
            </div>
          </>
        )}

        {listingView === "billing" && (
          <BillingTable className="flex-shrink-0 flex-1 overflow-hidden mt-5" />
        )}
      </div>

      {/* Right Panel - Cart/Sidebar - Fixed width */}
      <div className="w-96 h-full flex-shrink-0">
        <PosSidebar />
      </div>
    </div>
  );
}
