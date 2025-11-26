import { useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  createPurchaseSchema,
  CreatePurchaseSchema
} from "@/lib/zod/supplier.zod";
import { VendorSelector } from "@/modules/vendors/components/vendor-selector";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreatePurchase } from "../queries/use-create";

type Props = {
  children: React.ReactNode;
};

export function CreateNewPurchase({ children }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreatePurchase();

  const form = useForm<CreatePurchaseSchema>({
    resolver: zodResolver(createPurchaseSchema),
    defaultValues: {
      purchaseDescription: "",
      vendorId: "",
      paidAmount: 0
    }
  });

  const onSubmit = (data: CreatePurchaseSchema) => {
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
      <DialogContent className="sm:max-w-[425px]">
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
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor ID</FormLabel>
                    <FormControl>
                      <VendorSelector
                        selectedVendorId={field.value}
                        onSelectVendorId={(id) => field.onChange(id)}
                        className="w-full h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchaseDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder={"Enter description"} {...field} />
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
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
