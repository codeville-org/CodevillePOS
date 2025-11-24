import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockFadingIcon,
  SortAscIcon,
  SortDescIcon,
  UserCircle2Icon
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SelectShift } from "@/lib/zod/cashflow.zod";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { useGetAllShifts } from "../queries/use-get-shifts";

type Props = { className?: string };

export function ShiftListing({ className }: Props) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { setActiveListingShift } = useCashflow();

  const { data, isFetching, error } = useGetAllShifts({
    search,
    sort,

    page: currentPage.toString(),
    limit: itemsPerPage.toString()
  });

  useEffect(() => {
    if (error || isFetching) return;

    if (data && data?.data?.length > 0) {
      if (!data?.data[0].endedAt) {
        setActiveListingShift(data?.data[0]);
      }
    }
  }, [data, isFetching, error]);

  const handlePageChange = (action: "next" | "prev") => {
    if (action === "next") {
      setCurrentPage((prevPage) => prevPage + 1);
    } else if (action === "prev") {
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    }
  };

  const handleClickShift = (shift: SelectShift) => {
    setActiveListingShift(shift);
  };

  return (
    <Card className={cn("flex flex-col gap-2", className)}>
      {/* Shifts Search and Sort */}
      <div className="flex items-center gap-2">
        <Input
          className="flex-1 h-11"
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          size="icon"
          variant="outline"
          className="size-11"
          onClick={() => {
            if (sort === "asc") {
              setSort("desc");
            } else setSort("asc");
          }}
        >
          {sort === "asc" ? <SortDescIcon /> : <SortAscIcon />}
        </Button>
      </div>

      <div className="flex-1 h-full">
        <ScrollArea className="h-[calc(100dvh-22rem)]">
          <div className="flex flex-col gap-2">
            {isFetching ? (
              Array(50)
                .fill("_")
                .map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))
            ) : error ? (
              <div className="text-red-500">Error loading shifts.</div>
            ) : (
              data?.data?.map((item) => {
                const calculateElapsedTime = () => {
                  const startedAt = new Date(item.startedAt);
                  const now = new Date(item?.endedAt || Date.now());
                  const elapsedMs = now.getTime() - startedAt.getTime();

                  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
                  const minutes = Math.floor(
                    (elapsedMs % (1000 * 60 * 60)) / (1000 * 60)
                  );
                  const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

                  return `${hours}h ${minutes}m ${seconds}s`;
                };

                return (
                  <div
                    onClick={() => handleClickShift(item)}
                    key={item.event.id}
                    className="bg-sidebar/60 hover:bg-sidebar/90 cursor-pointer px-3 py-2 rounded-md border border-secondary/80"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2">
                        <UserCircle2Icon className="size-4 mt-1" />
                        <div className="space-y-0">
                          <p className="text-xs text-foreground/80">
                            Started By,
                          </p>
                          <p className="font-medium text-sm">
                            {item.event.user.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <ClockFadingIcon className="size-4 mt-1" />
                        <div className="space-y-0">
                          <p className="text-xs text-foreground/80">Duration</p>
                          <p className="font-medium text-sm">
                            {calculateElapsedTime()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs gap-2 text-foreground/80">
                        <CalendarIcon className="size-3" />
                        <p>{new Date(item.startedAt).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center text-xs gap-2 text-foreground/80">
                        <div
                          className={cn("size-3 rounded-full bg-amber-500", {
                            "bg-green-500": !item.endedAt
                          })}
                        />
                        <p
                          className={cn("text-xs", {
                            "text-amber-500": item.endedAt,
                            "text-green-500": !item.endedAt
                          })}
                        >
                          {item.endedAt ? "Ended" : "Ongoing"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      <div className="flex items-center justify-between w-full">
        <Button
          size="icon"
          variant="outline"
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}
        >
          <ArrowLeftIcon />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => handlePageChange("next")}
          disabled={
            data
              ? currentPage >= Math.ceil(data.meta.totalCount / itemsPerPage)
              : true
          }
        >
          <ArrowRightIcon />
        </Button>
      </div>
    </Card>
  );
}
