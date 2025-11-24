import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateEvent } from "../queries/use-create-event";

type Props = {
  children: React.ReactNode;
};

const manualCashAddSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  description: z.string().optional()
});

export type ManualCashAddFormData = z.infer<typeof manualCashAddSchema>;

export function ManualCashAddDialog({ children }: Props) {
  const [open, setOpen] = React.useState(false);
  const { mutate, isPending } = useCreateEvent();

  const form = useForm<ManualCashAddFormData>({
    resolver: zodResolver(manualCashAddSchema),
    defaultValues: {
      amount: 0,
      description: ""
    }
  });

  const onSubmit = (data: ManualCashAddFormData) => {
    mutate(
      {
        eventType: "manual_add",
        totalAmount: data.amount,
        description: data.description
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Cash</DialogTitle>
              <DialogDescription>
                You can manually add cash to the cashdrawer by specifying the
                amount and an optional description.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={"Enter amount to add"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
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
              <Button loading={isPending} type="submit">
                Add Cash
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
