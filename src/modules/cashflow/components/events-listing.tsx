import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  CalendarIcon,
  ClockFadingIcon,
  FlagIcon,
  PowerOffIcon,
  UserCircle2Icon
} from "lucide-react";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatPrice } from "@/lib/utils";
import { useCashflow } from "@/lib/zustand/cashflow-store";
import { useGetShiftEvents } from "../queries/use-get-shift-events";

type Props = {
  className?: string;
};

export function EventsListing({ className }: Props) {
  const { activeListingShift } = useCashflow();

  const [elapsedTime, setElapsedTime] = useState("");
  const [totalCashIn, setTotalCashIn] = useState(0);
  const [totalCashOut, setTotalCashOut] = useState(0);

  const { data, error, isFetching } = useGetShiftEvents();

  const calculateTotalCashInOut = () => {
    let cashIn = 0;
    let cashOut = 0;

    data?.forEach((event) => {
      if (event.eventType === "cash_in" || event.eventType === "manual_add") {
        cashIn += event.totalAmount;
      } else if (
        event.eventType === "cash_out" ||
        event.eventType === "manual_remove"
      ) {
        cashOut += event.totalAmount;
      }
    });
    setTotalCashIn(cashIn);
    setTotalCashOut(cashOut);
  };

  // Real-time elapsed time calculation for active shift
  useEffect(() => {
    if (!activeListingShift) {
      setElapsedTime("");
      return;
    }

    const calculateElapsedTime = () => {
      const startedAt = new Date(activeListingShift.startedAt);
      const end = new Date(activeListingShift.endedAt || new Date());
      const elapsedMs = end.getTime() - startedAt.getTime();

      const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
      const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

      return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Initial calculation
    setElapsedTime(calculateElapsedTime());

    // Update every second
    const interval = setInterval(() => {
      setElapsedTime(calculateElapsedTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeListingShift]);

  useEffect(() => {
    calculateTotalCashInOut();
  }, [data]);

  if (activeListingShift === null) {
    return (
      <Card
        className={cn("p-0 flex flex-col gap-0 overflow-hidden", className)}
      >
        <div className="w-full py-2 px-3">
          <p className="text-sm font-medium">No active shift selected</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-0 flex flex-col gap-0 overflow-hidden", className)}>
      {/* Header */}
      <div className="w-full py-2 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <UserCircle2Icon className="size-4 text-primary" />
              </div>

              <div className="space-y-0">
                <p className="text-xs text-foreground/80">Started By,</p>
                <p className="font-medium text-sm">
                  {activeListingShift.event.user.username}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <ClockFadingIcon className="size-4 text-primary" />
              </div>

              <div className="space-y-0">
                <p className="text-xs text-foreground/80">Duration</p>
                <p className="font-medium text-sm">{elapsedTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <CalendarIcon className="size-4 text-primary" />
              </div>

              <div className="space-y-0">
                <p className="text-xs text-foreground/80">Started At</p>
                <p className="font-medium text-sm">
                  {new Date(activeListingShift.startedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="space-y-0 text-right">
              <p className="text-xs text-foreground/80">Ended At</p>
              <p
                className={cn(" text-sm", {
                  "": activeListingShift.endedAt,
                  "text-green-500 font-medium": !activeListingShift.endedAt
                })}
              >
                {activeListingShift.endedAt
                  ? new Date(activeListingShift.endedAt).toDateString()
                  : "Ongoing"}
              </p>
            </div>

            <div className="p-2 rounded-full bg-primary/10">
              <CalendarIcon className="size-4 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <Separator className="mb-2" />

      <div className="flex-1 h-full">
        <ScrollArea className="h-[calc(100dvh-23rem)]">
          <div className="flex flex-col gap-2">
            {isFetching ? (
              Array(3)
                .fill("_")
                .map((_, index) => (
                  <Skeleton key={index} className="h-11 w-full" />
                ))
            ) : error ? (
              <div className="w-full py-2 px-3">
                <p className="text-sm font-medium text-red-600">
                  Error loading events.
                </p>
              </div>
            ) : data && data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item.id}
                  className="bg-sidebar/60 hover:bg-sidebar/90 px-3 py-2 rounded-md border border-secondary/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={cn("p-2 bg-primary rounded-full w-fit", {
                        "bg-green-500":
                          item.eventType === "cash_in" ||
                          item.eventType === "manual_add",
                        "bg-red-500":
                          item.eventType === "cash_out" ||
                          item.eventType === "manual_remove",
                        "bg-amber-500": item.eventType === "opening_balance",
                        "bg-purple-500": item.eventType === "shift_end"
                      })}
                    >
                      {item.eventType === "cash_in" && (
                        <BanknoteArrowDown className="size-6 text-primary-foreground" />
                      )}
                      {item.eventType === "cash_out" && (
                        <BanknoteArrowUp className="size-6 text-primary-foreground" />
                      )}
                      {item.eventType === "manual_add" && (
                        <BanknoteArrowDown className="size-6 text-primary-foreground" />
                      )}
                      {item.eventType === "manual_remove" && (
                        <BanknoteArrowUp className="size-6 text-primary-foreground" />
                      )}
                      {item.eventType === "opening_balance" && (
                        <FlagIcon className="size-6 text-primary-foreground" />
                      )}
                      {item.eventType === "shift_end" && (
                        <PowerOffIcon className="size-6 text-primary-foreground" />
                      )}
                    </div>

                    <div className="space-y-0">
                      <p className="text-xs">Event Type</p>
                      <h2 className="text-base font-semibold">
                        {item.eventType === "cash_in" && "Cash In"}
                        {item.eventType === "cash_out" && "Cash Out"}
                        {item.eventType === "manual_add" && "Manual Add"}
                        {item.eventType === "manual_remove" && "Manual Remove"}
                        {item.eventType === "opening_balance" &&
                          "Opening Balance"}
                        {item.eventType === "shift_end" && "Shift End"}
                      </h2>
                    </div>

                    <div className="space-y-0">
                      <p className="text-xs">Event Time</p>
                      <h2 className="text-base">
                        {new Date(item.updatedAt).toLocaleTimeString()}
                      </h2>
                    </div>

                    {item.transaction && (
                      <div className="space-y-0">
                        <p className="text-xs">Transaction</p>
                        <h2 className="text-sm text-foreground/90 cursor-pointer hover:underline">
                          {item.transaction?.transactionNumber}
                        </h2>
                      </div>
                    )}
                  </div>

                  <div className="space-y-0">
                    <p className="text-xs">Total Amount</p>
                    <h2 className="text-base font-semibold text-green-600">
                      {formatPrice(item.totalAmount)}
                    </h2>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      <div className="flex items-center justify-between w-full">
        <div className="p-4 pb-1">
          <p className="text-xs text-foreground/80">Total Cash In</p>
          <h2 className="text-lg font-semibold text-green-600">
            {formatPrice(totalCashIn)}
          </h2>
        </div>
        <div className="p-4 pb-1">
          <p className="text-xs text-foreground/80">Total Cash Out</p>
          <h2 className="text-lg font-semibold text-red-600">
            {formatPrice(totalCashOut)}
          </h2>
        </div>
      </div>
    </Card>
  );
}
