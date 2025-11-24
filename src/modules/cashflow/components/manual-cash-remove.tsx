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

const manualCashRemoveSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  description: z.string().optional()
});

export type ManualCashRemoveFormData = z.infer<typeof manualCashRemoveSchema>;

export function ManualCashRemoveDialog({ children }: Props) {
  const [open, setOpen] = React.useState(false);
  const { mutate, isPending } = useCreateEvent();

  const form = useForm<ManualCashRemoveFormData>({
    resolver: zodResolver(manualCashRemoveSchema),
    defaultValues: {
      amount: 0,
      description: ""
    }
  });

  const onSubmit = (data: ManualCashRemoveFormData) => {
    mutate(
      {
        eventType: "manual_remove",
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
              <DialogTitle>Remove Cash</DialogTitle>
              <DialogDescription>
                You can manually remove cash from the cashdrawer by specifying
                the amount and an optional description.
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
                        placeholder={"Enter amount to remove"}
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
                Remove Cash
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
