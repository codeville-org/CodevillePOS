import { ArrowLeftIcon, CalendarIcon, ClockFadingIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { SelectPurchaseSchema } from "@/lib/zod/supplier.zod";

type Props = {
  purchase: SelectPurchaseSchema;
};

export function SinglePurchaseHeader({ purchase }: Props) {
  return (
    <div className="w-full px-1 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <Button asChild size="icon">
          <Link to={{ pathname: "/supplier-management/purchases" }}>
            <ArrowLeftIcon />
          </Link>
        </Button>

        <div className="space-y-1">
          {purchase.purchaseDescription && (
            <p className="text-sm font-semibold text-foreground">
              {purchase.purchaseDescription}
            </p>
          )}

          <div className="flex items-center gap-3">
            <small className="text-xs text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="size-3" />
              {`${new Date(purchase.createdAt).toLocaleDateString()}`}
            </small>
            <small className="text-xs text-muted-foreground flex items-center gap-2">
              <ClockFadingIcon className="size-3" />
              {`Updated: ${new Date(purchase.updatedAt).toLocaleString()}`}
            </small>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-sidebar/60 border border-sidebar px-4 py-2 rounded-md">
        <div className="space-y-0">
          <small className="text-sm text-purple-600/70">Vendor</small>
          <p className="font-semibold text-purple-500">
            {purchase.vendor?.name}
          </p>
        </div>
        <div className="space-y-0 border-x border-sidebar px-3">
          <small className="text-sm text-blue-600/70">Total Amount</small>
          <p className="font-semibold text-blue-500">
            {formatPrice(purchase.totalAmount)}
          </p>
        </div>
        <div className="space-y-0 border-x border-sidebar px-3">
          <small className="text-sm text-green-600/70">Paid Amount</small>
          <p className="font-semibold text-green-500">
            {formatPrice(purchase.paidAmount)}
          </p>
        </div>
        <div className="space-y-0">
          <small className="text-sm text-amber-600/70">Due Amount</small>
          <p className="font-semibold text-amber-500">
            {formatPrice(purchase.dueAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}
