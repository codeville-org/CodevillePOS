import React, { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useGetAllVendors } from "../queries/use-get-all";

type Props = {
  selectedVendorId?: string | null;
  onSelectVendorId: (vendorId: string | null) => void;
  className?: string;
};

export function VendorSelector({
  selectedVendorId,
  onSelectVendorId,
  className
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [search, setSearch] = React.useState("");

  const { data, isFetching, error } = useGetAllVendors({ search });

  useEffect(() => {
    if (selectedVendorId && data?.data) {
      const filtered = data.data.find(
        (vendor) => vendor.id === selectedVendorId
      );
      if (filtered) {
        setValue(filtered.name);
      }
    }
  }, [selectedVendorId, data]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          {value
            ? data?.data.find((vendor) => vendor.name === value)?.name
            : "Select vendor..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder="Search vendor..."
            className="h-9"
            onValueChange={(val) => setSearch(val)}
          />
          <CommandList>
            <CommandEmpty>No vendor found.</CommandEmpty>
            <CommandGroup>
              {isFetching ? (
                Array(5)
                  .fill("_")
                  .map((_, index) => (
                    <Skeleton key={index} className="w-full h-4" />
                  ))
              ) : error ? (
                <span>{error.message}</span>
              ) : (
                data?.data.map((vendor) => (
                  <CommandItem
                    key={vendor.id}
                    value={vendor.name}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      onSelectVendorId(
                        currentValue === value ? null : vendor.id
                      );
                      setOpen(false);
                    }}
                  >
                    {vendor.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === vendor.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
