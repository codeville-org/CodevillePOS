import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { SelectProductSchema } from "@/lib/zod/products.zod";
import {
  addPurchaseItemSchema,
  AddPurchaseItemSchema
} from "@/lib/zod/supplier.zod";
import { useGetAllProducts } from "@/modules/products/queries/use-get-all";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { usePurchaseAddItem } from "../queries/use-add-item";

type Props = {
  children: React.ReactNode;
  purchaseId: string;
};

export function AddNewPurchaseItemDialog({ children, purchaseId }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = usePurchaseAddItem();
  const [selectedProduct, setSelectedProduct] =
    useState<SelectProductSchema | null>(null);

  const [productSearch, setProductSearch] = useState<string>("");

  const {
    data: products,
    isFetching,
    error: productsError
  } = useGetAllProducts({ search: productSearch, limit: "5" });

  const form = useForm<AddPurchaseItemSchema>({
    resolver: zodResolver(addPurchaseItemSchema),
    defaultValues: {
      purchaseId,
      productId: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }
  });

  useEffect(() => {
    if (selectedProduct) {
      form.setValue("unitPrice", selectedProduct.unitPrice);
      form.setValue("totalPrice", selectedProduct.unitPrice * 1); // quantity is 1 by default
    }
  }, [selectedProduct]);

  const onSubmit = (data: AddPurchaseItemSchema) => {
    console.log("Selected Product :", selectedProduct);

    mutate(data, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>New Vendor</DialogTitle>
              <DialogDescription>
                Fill the form below to create a new vendor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Product</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          className="w-full h-10"
                          placeholder="Search product name / barcode"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                        />

                        {isFetching ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="size-4 animate-spin" />
                          </div>
                        ) : productsError ? (
                          <p>{productsError.message}</p>
                        ) : products ? (
                          <div className="flex flex-col gap-3">
                            {products.data.map((item) => (
                              <div
                                key={item.id}
                                className={`p-2 rounded-md cursor-pointer bg-secondary/40 hover:bg-secondary/60 border border-secondary/60 flex items-center justify-between ${
                                  field.value === item.id
                                    ? "bg-secondary/80 border-secondary"
                                    : ""
                                }`}
                                onClick={() => {
                                  field.onChange(item.id);
                                  setSelectedProduct(item);
                                }}
                              >
                                <div className="space-y-1">
                                  <p className="font-medium text-foreground">
                                    {item.name}
                                  </p>
                                  <p className="text-sm text-foreground/80">
                                    SKU: {item.barcode} | Price:{" "}
                                    {formatPrice(item.unitPrice)}
                                  </p>
                                </div>

                                {field.value === item.id && (
                                  <CheckCircle2Icon
                                    className="size-6 mr-2"
                                    fill="#21c442"
                                    color="#fff"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" loading={isPending}>
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
