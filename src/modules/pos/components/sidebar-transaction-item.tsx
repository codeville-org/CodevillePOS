import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { UninitializedTransactionItem } from "@/lib/zod/transactions.zod";
import { usePosStore } from "@/lib/zustand/pos-store";

type Props = {
  item: UninitializedTransactionItem;
};

export function SidebarTransactionItem({ item }: Props) {
  const [qtyValue, setQtyValue] = useState<string>("");
  const { removeTransactionItem } = usePosStore();
  const { changeTransactionItemQuantity } = usePosStore();

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
    <Card className="px-2 py-3 bg-white dark:bg-secondary/60 flex flex-col gap-3 shadow-none rounded-md w-full">
      <div className="w-full flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold leading-tight break-words flex-1 min-w-0">
          {item.productName}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            className="p-1 rounded-full size-6 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex-shrink-0"
            size="icon"
            onClick={() => removeTransactionItem(item.productId)}
          >
            <TrashIcon />
          </Button>

          <div className="bg-secondary/40 flex items-center h-7 flex-shrink-0">
            <button
              className="size-7 bg-secondary text-secondary-foreground flex items-center justify-center rounded-l-md hover:bg-secondary-foreground/30 cursor-pointer"
              onClick={() =>
                changeTransactionItemQuantity(item.productId, item.quantity - 1)
              }
            >
              <MinusIcon className="size-3" />
            </button>

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
              className="text-sm h-7 w-10 text-center text-foreground bg-secondary/40 focus:outline-none"
            />

            <div className="size-7 text-sm bg-secondary/40 text-secondary-foreground flex items-center justify-center">
              {item.unit}
            </div>

            <button
              className="size-7 bg-secondary text-secondary-foreground flex items-center justify-center rounded-r-md hover:bg-secondary-foreground/30 cursor-pointer"
              onClick={() =>
                changeTransactionItemQuantity(item.productId, item.quantity + 1)
              }
            >
              <PlusIcon className="size-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <span className="text-sm text-red-500 font-semibold whitespace-nowrap">
            {formatPrice(item.totalAmount)}
          </span>
        </div>
      </div>
    </Card>
  );
}
