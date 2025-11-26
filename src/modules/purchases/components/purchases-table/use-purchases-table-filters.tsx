import { useQueryState } from "nuqs";

import { searchParams } from "@/lib/searchparams";

export function usePurchasesTableFilters() {
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

  const [vendorId, setVendorId] = useQueryState(
    "vendorId",
    searchParams.vendorId.withDefault("")
  );

  const resetFilters = () => {
    setSearchQuery("");
    setSort("desc");
    setVendorId("");
    setPage(1);
  };

  const isAnyFilterActive = searchQuery !== "" || vendorId !== "";

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

    vendorId,
    setVendorId,

    // Reset
    resetFilters,
    isAnyFilterActive
  };
}
