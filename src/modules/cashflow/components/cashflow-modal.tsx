import React, { useEffect, useState } from "react";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BanknoteIcon, CoinsIcon } from "lucide-react";

// Denomination Images
import rb100Image from "@/assets/images/denominations/RB100.jpg";
import rb1000Image from "@/assets/images/denominations/RB1000.jpg";
import rb20Image from "@/assets/images/denominations/RB20.jpg";
import rb50Image from "@/assets/images/denominations/RB50.jpg";
import rb500Image from "@/assets/images/denominations/RB500.jpg";
import rb5000Image from "@/assets/images/denominations/RB5000.jpg";
import rc1Image from "@/assets/images/denominations/RC1.jpg";
import rc10Image from "@/assets/images/denominations/RC10.jpg";
import rc2Image from "@/assets/images/denominations/RC2.jpg";
import rc5Image from "@/assets/images/denominations/RC5.jpg";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Denominations } from "@/lib/zod/cashflow.zod";
import { useSecurityStore } from "@/lib/zustand/security-store";
import { useGetCashflowBalance } from "../queries/use-get-balance";
import { useUpdateBalance } from "../queries/use-update-balance";

type Props = {
  children: React.ReactNode;
};

export function CashflowModal({ children }: Props) {
  const { user } = useSecurityStore();
  const { mutate: updateBalance, isPending: isUpdating } = useUpdateBalance();
  const { data: currentBalance, isPending: isLoadingBalance } =
    useGetCashflowBalance();

  const [open, setOpen] = useState<boolean>(false);
  const [denominations, setDenominations] = useState<Denominations>({
    coins_1: 0,
    coins_10: 0,
    coins_2: 0,
    coins_5: 0,
    notes_100: 0,
    notes_1000: 0,
    notes_20: 0,
    notes_2000: 0,
    notes_50: 0,
    notes_500: 0,
    notes_5000: 0
  });
  const [totalFloat, setTotalFloat] = useState<number>(0);
  const [totalNotesFloat, setTotalNotesFloat] = useState<number>(0);
  const [totalCoinsFloat, setTotalCoinsFloat] = useState<number>(0);

  const [coins1Value, setCoins1Value] = useState<string>("");
  const [coins10Value, setCoins10Value] = useState<string>("");
  const [coins2Value, setCoins2Value] = useState<string>("");
  const [coins5Value, setCoins5Value] = useState<string>("");
  const [notes100Value, setNotes100Value] = useState<string>("");
  const [notes1000Value, setNotes1000Value] = useState<string>("");
  const [notes20Value, setNotes20Value] = useState<string>("");
  // const [notes2000Value, setNotes2000Value] = useState<string>("");
  const [notes50Value, setNotes50Value] = useState<string>("");
  const [notes500Value, setNotes500Value] = useState<string>("");
  const [notes5000Value, setNotes5000Value] = useState<string>("");

  // Update local values when currentBalance is fetched
  useEffect(() => {
    if (isLoadingBalance) return;

    if (currentBalance) {
      handleUpdateDenomination("coins_1", currentBalance.coins_1.toString());
      handleUpdateDenomination("coins_2", currentBalance.coins_2.toString());
      handleUpdateDenomination("coins_5", currentBalance.coins_5.toString());
      handleUpdateDenomination("coins_10", currentBalance.coins_10.toString());
      handleUpdateDenomination("notes_20", currentBalance.notes_20.toString());
      handleUpdateDenomination("notes_50", currentBalance.notes_50.toString());
      handleUpdateDenomination(
        "notes_100",
        currentBalance.notes_100.toString()
      );
      handleUpdateDenomination(
        "notes_500",
        currentBalance.notes_500.toString()
      );
      handleUpdateDenomination(
        "notes_1000",
        currentBalance.notes_1000.toString()
      );
      handleUpdateDenomination(
        "notes_5000",
        currentBalance.notes_5000.toString()
      );
    }
  }, [currentBalance, isLoadingBalance]);

  useEffect(() => {
    // Calculate Total Float
    const totalNotes =
      denominations.notes_20 * 20 +
      denominations.notes_50 * 50 +
      denominations.notes_100 * 100 +
      denominations.notes_500 * 500 +
      denominations.notes_1000 * 1000 +
      denominations.notes_5000 * 5000;

    const totalCoins =
      denominations.coins_1 * 1 +
      denominations.coins_2 * 2 +
      denominations.coins_5 * 5 +
      denominations.coins_10 * 10;

    setTotalNotesFloat(totalNotes);
    setTotalCoinsFloat(totalCoins);
    setTotalFloat(totalNotes + totalCoins);
  }, [denominations]);

  const handleUpdateDenomination = (
    type: keyof Denominations,
    value: string
  ) => {
    if (value !== "") {
      const numericValue = parseInt(value, 10);

      if (isNaN(numericValue)) return;

      setDenominations((prev) => ({
        ...prev,
        [type]: numericValue
      }));
    } else {
      setDenominations((prev) => ({
        ...prev,
        [type]: 0
      }));
    }

    switch (type) {
      case "coins_1":
        setCoins1Value(value);
        break;
      case "coins_2":
        setCoins2Value(value);
        break;
      case "coins_5":
        setCoins5Value(value);
        break;
      case "coins_10":
        setCoins10Value(value);
        break;
      case "notes_20":
        setNotes20Value(value);
        break;
      case "notes_50":
        setNotes50Value(value);
        break;
      case "notes_100":
        setNotes100Value(value);
        break;
      case "notes_500":
        setNotes500Value(value);
        break;
      case "notes_1000":
        setNotes1000Value(value);
        break;
      case "notes_5000":
        setNotes5000Value(value);
        break;
      default:
        break;
    }
  };

  const handleMutation = () => {
    if (!user) return;

    updateBalance({
      ...denominations,
      isActive: true,
      lastUpdatedBy: user.id,
      totalAmount: totalFloat
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-5xl max-h-[95vh]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Manage Cash Drawer and Work Shift</DialogTitle>
          <DialogDescription>
            You can manage cash drawer balance & start / end work shifts here
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[68vh] bg-secondary/50 border border-secondary rounded-md">
          <div className="px-3 py-2 flex items-center justify-between">
            <h2 className="text-sm flex items-center gap-3 text-foreground/90">
              <BanknoteIcon className="size-6" /> Bank Notes
            </h2>

            <Badge>Total: {formatPrice(totalNotesFloat)}</Badge>
          </div>
          <Separator className="w-full" />

          <div className="mt-2 grid grid-cols-3 gap-4 p-4">
            {/* Denomination 1 */}
            <Card className="p-0 flex flex-col gap-0 dark:bg-secondary border border-secondary-foreground/70 overflow-hidden">
              <img className="w-full h-auto object-cover" src={rb20Image} />
              <input
                type="text"
                value={notes20Value}
                onChange={(e) =>
                  handleUpdateDenomination("notes_20", e.target.value)
                }
                className="w-full h-full min-h-10 text-center border-b-2 border-dashed border-primary"
                placeholder="Type Notes Count..."
              />
            </Card>
            {/* Denomination 2 */}
            <Card className="p-0  flex flex-col gap-0 dark:bg-secondary border border-secondary-foreground/70 overflow-hidden">
              <img className="w-full h-auto object-cover" src={rb50Image} />
              <input
                type="text"
                value={notes50Value}
                onChange={(e) =>
                  handleUpdateDenomination("notes_50", e.target.value)
                }
                className="w-full h-full min-h-10 text-center border-b-2 border-dashed border-primary"
                placeholder="Type Notes Count..."
              />
            </Card>
            {/* Denomination 3 */}
            <Card className="p-0  flex flex-col gap-0 dark:bg-secondary border border-secondary-foreground/70 overflow-hidden">
              <img className="w-full h-auto object-cover" src={rb100Image} />
              <input
                type="text"
                value={notes100Value}
                onChange={(e) =>
                  handleUpdateDenomination("notes_100", e.target.value)
                }
                className="w-full h-full min-h-10 text-center border-b-2 border-dashed border-primary"
                placeholder="Type Notes Count..."
              />
            </Card>
            {/* Denomination 4 */}
            <Card className="p-0  flex flex-col gap-0 dark:bg-secondary border border-secondary-foreground/70 overflow-hidden">
              <img className="w-full h-auto object-cover" src={rb500Image} />
              <input
                type="text"
                value={notes500Value}
                onChange={(e) =>
                  handleUpdateDenomination("notes_500", e.target.value)
                }
                className="w-full h-full min-h-10 text-center border-b-2 border-dashed border-primary"
                placeholder="Type Notes Count..."
              />
            </Card>
            {/* Denomination 5 */}
            <Card className="p-0  flex flex-col gap-0 dark:bg-secondary border border-secondary-foreground/70 overflow-hidden">
              <img className="w-full h-auto object-cover" src={rb1000Image} />
              <input
                type="text"
                value={notes1000Value}
                onChange={(e) =>
                  handleUpdateDenomination("notes_1000", e.target.value)
                }
                className="w-full h-full min-h-10 text-center border-b-2 border-dashed border-primary"
                placeholder="Type Notes Count..."
              />
            </Card>
            {/* Denomination 6 */}
            <Card className="p-0  flex flex-col gap-0 dark:bg-secondary border border-secondary-foreground/70 overflow-hidden">
              <img className="w-full h-auto object-cover" src={rb5000Image} />
              <input
                type="text"
                value={notes5000Value}
                onChange={(e) =>
                  handleUpdateDenomination("notes_5000", e.target.value)
                }
                className="w-full h-full min-h-10 text-center border-b-2 border-dashed border-primary"
                placeholder="Type Notes Count..."
              />
            </Card>
          </div>

          <div className="mt-3 px-3 py-2 flex items-center justify-between">
            <h2 className="text-sm flex items-center gap-3 text-foreground/90">
              <CoinsIcon className="size-6" /> Bank Coins
            </h2>

            <Badge>Total: {formatPrice(totalCoinsFloat)}</Badge>
          </div>
          <Separator className="w-full" />

          <div className="mt-2 grid grid-cols-4 gap-4 p-4">
            {/* Denomination 7 */}
            <Card className="p-0  flex flex-col gap-0 dark:bg-secondary border border-secondary-foreground/70 overflow-hidden items-center justify-center">
              <img
                className="mt-2 size-36 object-cover rounded-full"
                src={rc1Image}
              />
              <input
                type="text"
                value={coins1Value}
                onChange={(e) =>
                  handleUpdateDenomination("coins_1", e.target.value)
                }
                className="w-full h-full min-h-14 text-center border-b-2 border-dashed border-primary"
                placeholder="Type Coins Count..."
              />
            </Card>
            {/* Denomination 8 */}
            <Card className="p-0  flex flex-col gap-0 dark:bg-secondary border border-secondary-foreground/70 overflow-hidden items-center justify-center">
              <img
                className="mt-2 size-36 object-cover rounded-full"
                src={rc2Image}
              />
              <input
                type="text"
                value={coins2Value}
                onChange={(e) =>
                  handleUpdateDenomination("coins_2", e.target.value)
                }
                className="w-full h-full min-h-14 text-center border-b-2 border-dashed border-primary"
                placeholder="Type Coins Count..."
              />
            </Card>
            {/* Denomination 9 */}
            <Card className="p-0  flex flex-col gap-0 dark:bg-secondary border border-secondary-foreground/70 overflow-hidden items-center justify-center">
              <img
                className="mt-2 size-36 object-cover rounded-full"
                src={rc5Image}
              />
              <input
                type="text"
                value={coins5Value}
                onChange={(e) =>
                  handleUpdateDenomination("coins_5", e.target.value)
                }
                className="w-full h-full min-h-14 text-center border-b-2 border-dashed border-primary"
                placeholder="Type Coins Count..."
              />
            </Card>
            {/* Denomination 10 */}
            <Card className="p-0  flex flex-col gap-0 dark:bg-secondary border border-secondary-foreground/70 overflow-hidden items-center justify-center">
              <img
                className="mt-2 size-36 object-cover rounded-full"
                src={rc10Image}
              />
              <input
                type="text"
                value={coins10Value}
                onChange={(e) =>
                  handleUpdateDenomination("coins_10", e.target.value)
                }
                className="w-full h-full min-h-14 text-center border-b-2 border-dashed border-primary"
                placeholder="Type Coins Count..."
              />
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="h-14 mt-2 w-full flex items-center justify-center flex-row gap-2">
          <Card className="flex-1 h-full rounded-md flex flex-col gap-0 items-center justify-center bg-primary/20 border border-primary">
            <h2 className="font-semibold text-lg text-primary">
              {formatPrice(totalFloat)}
            </h2>
            <p className="text-xs">Total Float</p>
          </Card>

          <Button
            variant="default"
            className="flex-1 h-full text-base font-medium"
            onClick={handleMutation}
            loading={isUpdating}
          >
            Update Balance
          </Button>

          <DialogClose asChild className="">
            <Button variant="destructive" className="h-full">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
