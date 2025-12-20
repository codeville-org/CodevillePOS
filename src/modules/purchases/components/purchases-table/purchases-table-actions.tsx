"use client";

import { DataTableResetFilter } from "@/components/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/table/data-table-search";
import { Button } from "@/components/ui/button";
import { VendorSelector } from "@/modules/vendors/components/vendor-selector";
import { SortAsc, SortDesc } from "lucide-react";
import { usePurchasesTableFilters } from "./use-purchases-table-filters";

export function PurchasesTableActions() {
  const {
    searchQuery,
    setSearchQuery,
    setPage,
    sort,
    setSort,
    vendorId,
    setVendorId,

    // Reset
    resetFilters,
    isAnyFilterActive
  } = usePurchasesTableFilters();

  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            if (sort === "asc") {
              setSort("desc");
            } else setSort("asc");
          }}
          className="size-11"
        >
          {sort === "asc" ? <SortDesc /> : <SortAsc />}
        </Button>

        <DataTableSearch
          searchKey="totalAmount"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
          className="h-11"
        />
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
          className="h-11"
        />
      </div>

      <div>
        <VendorSelector
          selectedVendorId={vendorId}
          onSelectVendorId={setVendorId}
          className={"h-11"}
        />
      </div>
    </div>
  );
}
