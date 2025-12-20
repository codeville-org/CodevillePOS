import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DataTableResetFilterProps = {
  isFilterActive: boolean;
  onReset: () => void;
  className?: string;
};

export function DataTableResetFilter({
  isFilterActive,
  onReset,
  className
}: DataTableResetFilterProps) {
  return (
    <>
      {isFilterActive ? (
        <Button
          variant="outline"
          onClick={onReset}
          className={cn("", className)}
        >
          Reset Filters
        </Button>
      ) : null}
    </>
  );
}
