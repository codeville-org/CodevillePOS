import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn, formatPrice } from "@/lib/utils";
import { usePosStore } from "@/lib/zustand/pos-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { UninitializedTransactionItem } from "@/lib/zod/transactions.zod";

type Props = {
  className?: string;
};

export function BillingTable({ className }: Props) {
  const {
    setListingView,
    transactionItems,
    activeTransaction,
    setDiscountAmount,
    setTaxAmount
  } = usePosStore();

  useEffect(() => {
    // If active transaction got "null", set listing view to "listing"
    if (!activeTransaction) {
      setListingView("listing");
    }
  }, [activeTransaction]);

  return (
    <div className={cn("flex-1 flex flex-col h-full", className)}>
      <div className="flex-1 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-secondary/50 dark:bg-secondary/30 text-sm text-foreground/60">
              <TableHead className="py-3 pl-5">Product</TableHead>
              <TableHead className="py-3">Unit Price</TableHead>
              <TableHead className="py-3">Quantity</TableHead>
              <TableHead className="py-3 text-right">Amount</TableHead>
              <TableHead className="py-3 text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="flex-1 flex-shrink-0">
            {transactionItems.map((item) => (
              <BillingTableItem item={item} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Billing Footer */}
      <div className="flex-shrink-0 border-t border-border/20 bg-secondary/40 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-foreground/80">Discount Price</Label>
            <Input
              className="h-12 bg-white"
              placeholder="Bill Discount"
              value={activeTransaction?.discountAmount || ""}
              onChange={(e) => {
                setDiscountAmount(Number(e.target.value));
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-foreground/80">Tax Amount</Label>
            <Input
              className="h-12 bg-white"
              placeholder="Tax Amount"
              value={activeTransaction?.taxAmount || ""}
              onChange={(e) => {
                setTaxAmount(Number(e.target.value));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BillingTableItem({
  item
}: {
  item: UninitializedTransactionItem;
}) {
  const [qtyValue, setQtyValue] = useState<string>("");
  const { removeTransactionItem, changeTransactionItemQuantity } =
    usePosStore();

  // Initialize and sync qtyValue with item.quantity
  useEffect(() => {
    setQtyValue(item.quantity.toString());
  }, [item.quantity]);

  const handleChangeQuantity = (value: string) => {
    setQtyValue(value);

    if (value === "") {
      // When field is cleared, reset quantity to 1 for better UX
      changeTransactionItemQuantity(item.productId, 1);
      return;
    }

    const numericValue = Number(value);
    if (numericValue > 0) {
      changeTransactionItemQuantity(item.productId, numericValue);
    }
  };

  const handleBlur = () => {
    // If input is empty on blur, reset to show "1" (which matches the quantity we set)
    if (qtyValue === "") {
      setQtyValue("1");
    }
  };

  return (
    <TableRow key={item.productId} className="text-base">
      <TableCell className="py-3 pl-5">{item.productName}</TableCell>
      <TableCell className="py-3">{formatPrice(item.unitPrice)}</TableCell>
      <TableCell className="py-3">
        <div className="bg-secondary/40 flex items-center h-10 w-full max-w-44 rounded-lg">
          <Button
            className="size-10 min-w-10 flex items-center justify-center rounded-none rounded-l-md cursor-pointer bg-amber-500 hover:bg-amber-600 text-white hover:text-white"
            onClick={() =>
              changeTransactionItemQuantity(item.productId, item.quantity - 1)
            }
          >
            <MinusIcon className="size-4" strokeWidth={2} />
          </Button>

          <input
            type="text"
            value={qtyValue}
            placeholder="Qty"
            onChange={(e) => {
              // Check if input is a character or number before updating state
              if (/^[0-9]*$/.test(e.target.value)) {
                handleChangeQuantity(e.target.value);
              }
            }}
            onBlur={handleBlur}
            className="text-sm h-10 w-full text-center text-foreground bg-secondary/40 focus:outline-none"
          />

          <div className="size-10 min-w-10 text-sm bg-secondary/40 text-secondary-foreground flex items-center justify-center">
            {item.unit}
          </div>

          <Button
            className="size-10 min-w-10 flex items-center justify-center rounded-none rounded-r-md cursor-pointer  bg-green-500 hover:bg-green-600 text-white hover:text-white"
            onClick={() =>
              changeTransactionItemQuantity(item.productId, item.quantity + 1)
            }
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="py-3 text-right font-semibold">
        {formatPrice(item.totalAmount)}
      </TableCell>
      <TableCell className="py-3 text-right pr-5 flex items-center justify-end">
        <Button
          className="p-1 rounded-sm size-10 bg-red-500 text-white hover:bg-red-600/80 flex items-center justify-center"
          size="icon"
          onClick={() => removeTransactionItem(item.productId)}
        >
          <TrashIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
}
