import { ColumnDef } from "@tanstack/react-table";
import {
  EditIcon,
  MoreHorizontal,
  PersonStandingIcon,
  TrashIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { SelectVendorSchema } from "@/lib/zod/supplier.zod";
import { DeleteVendor } from "../delete";
import { UpdateVendor } from "../update";

// This type is used to define the shape of our data.
export type Vendor = Omit<SelectVendorSchema, "createdAt"> & {
  createdAt: string;
  updatedAt: string | null;
};

export const createColumns = (): ColumnDef<Vendor>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="bg-secondary p-2 rounded-full">
            <PersonStandingIcon className="size-4 text-secondary-foreground" />
          </div>
          <span>{row.getValue("name")}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "description",
    header: "Description"
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
      );
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const vendor = row.original;

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DeleteVendor id={vendor.id}>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-red-600"
              >
                <TrashIcon className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DeleteVendor>

            <UpdateVendor id={vendor.id}>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-amber-600"
              >
                <EditIcon className="size-4 mr-2" />
                Update
              </DropdownMenuItem>
            </UpdateVendor>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
