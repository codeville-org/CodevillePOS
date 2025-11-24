import {
  BanknoteArrowDown,
  CalendarIcon,
  ClockFadingIcon,
  UserCircle2Icon
} from "lucide-react";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn, formatPrice } from "@/lib/utils";
import { useCashflow } from "@/lib/zustand/cashflow-store";

type Props = {
  className?: string;
};

export function EventsListing({ className }: Props) {
  const { activeListingShift } = useCashflow();
  const [elapsedTime, setElapsedTime] = useState("");

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
        <ScrollArea className="h-[calc(100dvh-21rem)]">
          <div className="flex flex-col gap-2">
            {/* First opening balance event */}
            <div className="bg-primary/5 px-3 py-2 rounded-md border border-primary/40 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-2 bg-primary rounded-full w-fit">
                  <BanknoteArrowDown className="size-6 text-primary-foreground" />
                </div>

                <div className="space-y-0">
                  <p className="text-xs">Event Type</p>
                  <h2 className="text-base font-semibold">
                    {"Opening Balance"}
                  </h2>
                </div>

                <div className="space-y-0">
                  <p className="text-xs">Event Time</p>
                  <h2 className="text-base">
                    {new Date(
                      activeListingShift?.event?.updatedAt
                    ).toLocaleTimeString()}
                  </h2>
                </div>
              </div>

              <div className="space-y-0">
                <p className="text-xs">Total Amount</p>
                <h2 className="text-base font-semibold text-green-600">
                  {formatPrice(activeListingShift.event.totalAmount)}
                </h2>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <Separator />

      <div className="flex items-center justify-between w-full">
        <p>Cash In</p>
        <p>Cash Out</p>
      </div>
    </Card>
  );
}
