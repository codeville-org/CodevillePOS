"use client";

import { useQueryState } from "nuqs";

import { searchParams } from "@/lib/searchparams";

export function useVendorTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    searchParams.q
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault("")
  );

  const [page, setPage] = useQueryState(
    "page",
    searchParams.page.withDefault(1)
  );

  const [limit, setLimit] = useQueryState(
    "limit",
    searchParams.limit.withDefault(10)
  );

  const [sort, setSort] = useQueryState(
    "sort",
    searchParams.sort.withDefault("desc")
  );

  const resetFilters = () => {
    setSearchQuery("");
    setSort("desc");
    setPage(1);
  };

  const isAnyFilterActive = searchQuery !== "";

  return {
    // Search
    searchQuery,
    setSearchQuery,

    // Pagination
    page,
    setPage,
    limit,
    setLimit,

    sort,
    setSort,

    // Reset
    resetFilters,
    isAnyFilterActive
  };
}
