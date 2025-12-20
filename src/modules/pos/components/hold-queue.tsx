import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { usePosStore } from "@/lib/zustand/pos-store";
import { removeTransactionFromHoldQueue } from "@/lib/zustand/pos-store/actions";
import { CalendarIcon, PlayCircleIcon, ShoppingCartIcon } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

export function HoldQueue({ children }: Props) {
  const [open, setOpen] = useState(false);
  const {
    holdQueue,
    activeTransaction,
    setActiveTransaction,
    setTransactionItems
  } = usePosStore();

  const handleResumeTransaction = (id: string) => {
    if (activeTransaction) return;

    const holdItem = holdQueue.find((item) => item.id === id);
    if (!holdItem) return;

    // Get transaction object without holdItem.items field
    const { items, ...transaction } = holdItem;

    setActiveTransaction(transaction);
    setTransactionItems(items);

    removeTransactionFromHoldQueue(id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[530px]">
        <DialogHeader>
          <DialogTitle>Hold Queue</DialogTitle>
          <DialogDescription>
            Manage your held transactions here.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 flex flex-col gap-3">
          {holdQueue.length < 1 ? (
            <p>No items on hold.</p>
          ) : (
            holdQueue.map((item, index) => (
              <Card
                key={index}
                className="p-2 bg-secondary/20 border rounded-md shadow-none flex flex-row items-center justify-between"
              >
                <div className="flex-1 flex items-center gap-3">
                  <div className="size-11 bg-secondary flex items-center justify-center rounded-md">
                    <ShoppingCartIcon className="size-6 text-secondary-foreground" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-foreground font-medium">{`No: #${item.transactionNumber}`}</p>

                    <div className="text-xs flex items-center gap-4">
                      <div className="flex items-center gap-1 text-foreground/60">
                        <CalendarIcon className="size-3" />
                        <p>{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="">
                  <Button
                    size="icon"
                    disabled={!!activeTransaction}
                    onClick={() => handleResumeTransaction(item.id)}
                  >
                    <PlayCircleIcon className="size-5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
