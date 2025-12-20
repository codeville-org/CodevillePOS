import { cn } from "@/lib/utils";
import { EventsListing } from "./events-listing";
import { ShiftListing } from "./shift-listing";

type Props = {
  className?: string;
};

export function CashflowListing({ className }: Props) {
  return (
    <div className={cn("flex-1 flex h-full gap-2 flex-row-reverse", className)}>
      {/* List shifts */}
      <ShiftListing className="flex-1/3 p-2" />

      {/* List shift events details */}
      <EventsListing className="flex-2/3 p-2" />
    </div>
  );
}
