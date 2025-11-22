import {
  Grid2x2Icon,
  ListIcon,
  Loader,
  SortAscIcon,
  SortDescIcon,
  XIcon
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Pagination } from "@/components/layouts/dashboard/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ListingView } from "@/shared/types/global";
import { useGetAllUsers } from "../queries/use-get-all";
import { UserItem } from "./user-item";

type Props = {
  className?: string;
};

export function UsersListing({ className }: Props) {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [sortValue, setSortValue] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<ListingView>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, error } = useGetAllUsers({
    search: debouncedSearchValue,
    sort: sortValue,
    page: currentPage.toString(),
    limit: itemsPerPage.toString()
  });

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchValue]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div
      className={cn(
        "flex-1 flex flex-col h-full rounded-md bg-secondary/20 border border-foreground/5",
        className
      )}
    >
      {/* Actions */}
      <div className="flex p-2 items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="hover:text-foreground size-9 shadow-none"
            onClick={() => setSortValue(sortValue === "asc" ? "desc" : "asc")}
          >
            {sortValue === "asc" ? <SortDescIcon /> : <SortAscIcon />}
          </Button>
          <Input
            placeholder="Search by username/email..."
            className="shadow-none h-9"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>

        <div className="">
          <Button
            size="icon"
            variant="outline"
            className="hover:text-foreground size-9 shadow-none"
            onClick={() => setView(view === "grid" ? "list" : "grid")}
          >
            {view === "grid" ? <ListIcon /> : <Grid2x2Icon />}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex-1 h-full">
        <ScrollArea className="h-[calc(100dvh-385px)]">
          <div
            className={cn(
              "h-full",
              {
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4":
                  view === "grid",
                "flex flex-col": view === "list"
              },
              isLoading && "flex items-center justify-center min-h-[400px]",
              error && "flex items-center justify-center min-h-[400px]"
            )}
          >
            {isLoading && (
              <div className="p-2 rounded-full bg-secondary/20 text-secondary-foreground">
                <Loader className="animate-spin size-6" />
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center flex-col gap-2">
                <div className="p-2 rounded-full bg-destructive/20 text-destructive">
                  <XIcon className="size-6" />
                </div>

                <div className="text-sm text-center">{error.message}</div>
              </div>
            )}

            {data &&
              data.data.map((item) => (
                <UserItem key={item.id} user={item} view={view} />
              ))}
          </div>
        </ScrollArea>
      </div>

      {/* Pagination Bar */}
      {data && (
        <Pagination
          entityName="Users"
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalCount={data.meta.totalCount}
          totalPages={data.meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
