import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  BanknoteArrowUpIcon
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatPrice } from "@/lib/utils";
import { SelectPurchaseSchema } from "@/lib/zod/supplier.zod";
import { PurchaseItem } from "./purchase-item";

type Props = {
  purchase: SelectPurchaseSchema;
  className?: string;
};

export function ManagePurchase({ purchase, className }: Props) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Card className={cn("flex flex-col gap-2 flex-1/2 p-2", className)}>
        <div className="flex-1 h-full">
          <ScrollArea className="h-[calc(100dvh-17rem)]">
            <div className="flex flex-col gap-3">
              {purchase.purchaseItems?.map((item) => (
                <PurchaseItem key={item.id} item={item} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>

      <Card className={cn("flex flex-col gap-2 flex-1/2 p-2", className)}>
        <div className="flex-1 h-full">
          <ScrollArea className="h-[calc(100dvh-17rem)]">
            <div className="flex flex-col gap-2">
              {purchase.cashDrawerEvents &&
              purchase.cashDrawerEvents.length === 0 ? (
                <div className="min-h-[calc(100dvh-17rem)] h-full flex items-center justify-center gap-2 flex-col">
                  <div className="mt-4 bg-primary/10 p-2 rounded-full">
                    <BanknoteArrowUpIcon className="size-8 text-foreground/50" />
                  </div>
                  <p className="text-center text-sm text-foreground/60 mt-1">
                    No cash drawer events for this purchase.
                  </p>
                </div>
              ) : (
                purchase.cashDrawerEvents?.map((event) => (
                  <div
                    key={event.id}
                    className="bg-sidebar/60 hover:bg-sidebar/90 px-3 py-2 rounded-md border border-secondary/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className={cn("p-2 bg-primary rounded-full w-fit", {
                          "bg-green-500":
                            event.eventType === "cash_in" ||
                            event.eventType === "manual_add",
                          "bg-red-500":
                            event.eventType === "cash_out" ||
                            event.eventType === "manual_remove",
                          "bg-amber-500": event.eventType === "opening_balance",
                          "bg-purple-500": event.eventType === "shift_end"
                        })}
                      >
                        {event.eventType === "cash_in" && (
                          <BanknoteArrowDown className="size-6 text-primary-foreground" />
                        )}
                        {event.eventType === "cash_out" && (
                          <BanknoteArrowUp className="size-6 text-primary-foreground" />
                        )}
                        {event.eventType === "manual_add" && (
                          <BanknoteArrowDown className="size-6 text-primary-foreground" />
                        )}
                        {event.eventType === "manual_remove" && (
                          <BanknoteArrowUp className="size-6 text-primary-foreground" />
                        )}
                      </div>

                      <div className="space-y-0">
                        <p className="text-xs">Event Type</p>
                        <h2 className="text-base font-semibold">
                          {event.eventType === "cash_in" && "Cash In"}
                          {event.eventType === "cash_out" && "Cash Out"}
                          {event.eventType === "manual_add" && "Manual Add"}
                          {event.eventType === "manual_remove" &&
                            "Manual Remove"}
                        </h2>
                      </div>

                      <div className="space-y-0">
                        <p className="text-xs">Event Time</p>
                        <h2 className="text-base">
                          {new Date(event.updatedAt).toLocaleTimeString()}
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-0">
                      <p className="text-xs">Total Amount</p>
                      <h2 className="text-base font-semibold text-green-600">
                        {formatPrice(event.totalAmount)}
                      </h2>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}
