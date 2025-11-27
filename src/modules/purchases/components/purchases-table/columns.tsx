import { Link } from "react-router-dom";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowRightCircleIcon, PackagePlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn, formatPrice } from "@/lib/utils";
import { PurchaseListItemSchema } from "@/lib/zod/supplier.zod";

// This type is used to define the shape of our data.
export type PurchaseListItem = Omit<PurchaseListItemSchema, "createdAt"> & {
  createdAt: string;
  updatedAt: string | null;
};

export const createColumns = (): ColumnDef<PurchaseListItem>[] => [
  {
    accessorKey: "id",
    header: "",
    cell: () => {
      return (
        <div className="flex items-center gap-2">
          <div className="bg-secondary p-2 rounded-full">
            <PackagePlusIcon className="size-4 text-secondary-foreground" />
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "vendorId",
    header: "Vendor",
    cell: ({ row }) => {
      return <span>{row.original?.vendor?.name || "Unknown"}</span>;
    }
  },
  {
    accessorKey: "totalItems",
    header: "Total Items"
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      return <span>{formatPrice(row.original.totalAmount)}</span>;
    }
  },
  {
    accessorKey: "dueAmount",
    header: "Due Balance",
    cell: ({ row }) => {
      return (
        <span
          className={cn(
            row.original.dueAmount > 0 ? "text-red-600" : "text-green-600"
          )}
        >
          {formatPrice(row.original.dueAmount)}
        </span>
      );
    }
  },
  {
    accessorKey: "purchaseDescription",
    header: "Description",
    cell: ({ row }) => (
      <span className="line-clamp-1">{row.original.purchaseDescription}</span>
    )
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <Button asChild icon={<ArrowRightCircleIcon />} variant="default">
          <Link
            to={{
              pathname: `/supplier-management/purchases/${row.original.id}`
            }}
          >
            View Details
          </Link>
        </Button>
      );
    }
  }
];
