/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/components/table/data-table";
import DataTableError from "@/components/table/data-table-error";
import { DataTableSkeleton } from "@/components/table/data-table-skeleton";

import { useGetAllVendors } from "../queries/use-get-all";
import { createColumns } from "./vendors-table/columns";
import { useVendorTableFilters } from "./vendors-table/use-vendor-table-filters";

export default function VendorsTable() {
  const { page, limit, sort, searchQuery } = useVendorTableFilters();

  const { data, error, isPending } = useGetAllVendors({
    limit: limit.toString(),
    page: page.toString(),
    sort: sort as any,
    search: searchQuery
  });

  const columns = createColumns();

  if (isPending) {
    return <DataTableSkeleton />;
  }

  if (!data || error) {
    return <DataTableError error={error} />;
  }

  console.log("Vendors Table Data:", data);

  return (
    <DataTable
      columns={columns as any}
      data={data.data}
      totalItems={data.meta.totalCount}
    />
  );
}
