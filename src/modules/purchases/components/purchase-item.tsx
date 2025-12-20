import { useEffect, useState } from "react";

import { PencilIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SelectPurchaseItemSchema } from "@/lib/zod/supplier.zod";
import ImageDisplay from "@/modules/image-manager/components/image-display";
import { useDeletePurchaseItem } from "../queries/use-delete-item";
import { useUpdatePurchaseItem } from "../queries/use-update-item";

type Props = {
  item?: SelectPurchaseItemSchema;
};

export function PurchaseItem({ item }: Props) {
  const [quantity, setQuantity] = useState<string>(
    item?.quantity.toString() || "0"
  );
  const [unitPrice, setUnitPrice] = useState<string>(
    item?.unitPrice.toString() || "0"
  );
  const [totalPrice, setTotalPrice] = useState<string>(
    item?.totalPrice.toString() || "0"
  );

  // Sync local state with server data when item changes (from React Query updates)
  useEffect(() => {
    if (item) {
      setQuantity(item.quantity.toString());
      setUnitPrice(item.unitPrice.toString());
      setTotalPrice(item.totalPrice.toString());
    }
  }, [item]);

  const { mutate: update, isPending: updating } = useUpdatePurchaseItem();
  const { mutate: remove, isPending: deleting } = useDeletePurchaseItem();

  // Calculate total whenever quantity or unit price changes
  useEffect(() => {
    const quantityNum = parseFloat(quantity) || 0;
    const unitPriceNum = parseFloat(unitPrice) || 0;
    const calculated = (quantityNum * unitPriceNum).toString();
    setTotalPrice(calculated);
  }, [quantity, unitPrice]);

  const handleUpdate = () => {
    if (!item?.id) return;

    const quantityNum = parseFloat(quantity);
    const unitPriceNum = parseFloat(unitPrice);

    // Validate inputs
    if (
      isNaN(quantityNum) ||
      isNaN(unitPriceNum) ||
      quantityNum <= 0 ||
      unitPriceNum <= 0
    ) {
      return;
    }

    update({
      id: item.id,
      input: {
        quantity: quantityNum,
        unitPrice: unitPriceNum
      }
    });
  };

  const handleDelete = () => {
    if (!item?.id) return;
    remove(item.id);
  };

  console.log(item);

  return (
    <Card className="bg-secondary/60 p-3 shadow-none flex flex-col gap-1 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-[280px] flex items-center gap-2">
          <ImageDisplay
            alt={item.product?.name || "Product Image"}
            filename={item?.product?.imageFilename}
            className="size-12 aspect-square rounded-md"
            fallbackClassName="size-12 aspect-square rounded-md"
            isProductImage
          />

          <div className="space-y-0">
            <small className="text-xs text-foreground/80">Product Name</small>
            <h3 className="text-sm font-medium text-foreground line-clamp-1">
              {item?.product?.name}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            icon={<PencilIcon />}
            className="bg-amber-500 h-8 hover:bg-amber-600 text-amber-50 hover:text-amber-50"
            onClick={handleUpdate}
            loading={updating}
            disabled={updating || deleting}
          >
            Update
          </Button>
          <Button
            size="sm"
            icon={<TrashIcon />}
            variant="destructive"
            onClick={handleDelete}
            loading={deleting}
            disabled={updating || deleting}
            className="size-8"
          />
        </div>
      </div>

      <Separator className="my-2" />

      <div className="flex items-center gap-1">
        <div className="space-y-1">
          <small className="text-xs text-foreground/80">Quantity</small>
          <Input
            className="shadow-none bg-card"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <small className="text-xs text-foreground/80">Buying Price</small>
          <Input
            className="shadow-none bg-card"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <small className="text-xs text-foreground/80">Total</small>
          <Input
            className="shadow-none bg-card"
            disabled
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}
