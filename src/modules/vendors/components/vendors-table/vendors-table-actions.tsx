"use client";

import { DataTableResetFilter } from "@/components/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/table/data-table-search";
import { Button } from "@/components/ui/button";
import { SortAsc, SortDesc } from "lucide-react";
import { useVendorTableFilters } from "./use-vendor-table-filters";

export function VendorTableActions() {
  const {
    searchQuery,
    setSearchQuery,
    setPage,
    sort,
    setSort,

    // Reset
    resetFilters,
    isAnyFilterActive
  } = useVendorTableFilters();

  return (
    <div className="flex flex-wrap items-center gap-2">
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
        searchKey="title"
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
  );
}
