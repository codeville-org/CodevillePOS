/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/components/table/data-table";
import DataTableError from "@/components/table/data-table-error";
import { DataTableSkeleton } from "@/components/table/data-table-skeleton";

import { useGetAllPurchases } from "../queries/use-get-all";
import { createColumns } from "./purchases-table/columns";
import { usePurchasesTableFilters } from "./purchases-table/use-purchases-table-filters";

export default function PurchasesTable() {
  const { page, limit, sort, searchQuery, vendorId } =
    usePurchasesTableFilters();

  const { data, error, isPending } = useGetAllPurchases({
    limit: limit.toString(),
    page: page.toString(),
    sort: sort as any,
    search: searchQuery,
    vendorId
  });

  const columns = createColumns();

  if (isPending) {
    return <DataTableSkeleton />;
  }

  if (!data || error) {
    return <DataTableError error={error} />;
  }

  return (
    <DataTable
      columns={columns as any}
      data={data.data}
      totalItems={data.meta.totalCount}
    />
  );
}
