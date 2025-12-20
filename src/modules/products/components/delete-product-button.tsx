import { Button } from "@/components/ui/button";
import { TEXTS } from "@/lib/language";
import { SelectProductSchema } from "@/lib/zod/products.zod";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { Loader2, TrashIcon } from "lucide-react";
import { useDeleteProduct } from "../queries/use-delete";

type Props = {
  product: SelectProductSchema;
  size?: "icon" | "normal";
};

export default function DeleteProductButton({
  product,
  size = "normal"
}: Props) {
  const { mutate, isPending } = useDeleteProduct(product?.id);
  const { language } = usePersistStore();

  return (
    <Button
      type="button"
      size={size === "icon" ? "icon" : "default"}
      variant="destructive"
      onClick={() => mutate()}
    >
      {isPending ? <Loader2 className="animate-spin" /> : <TrashIcon />}
      {size === "normal" && TEXTS.actions.delete[language]}
    </Button>
  );
}
