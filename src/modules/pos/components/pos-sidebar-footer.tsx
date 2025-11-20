import {
  BanknoteIcon,
  CreditCardIcon,
  EraserIcon,
  HandCoinsIcon,
  PrinterCheckIcon,
  TrashIcon
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TEXTS } from "@/lib/language";
import { cn, formatPrice } from "@/lib/utils";
import { PaymentMethod } from "@/lib/zod/transactions.zod";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { usePosStore } from "@/lib/zustand/pos-store";
import { useCompleteTransaction } from "../queries/use-complete-transaction";

type Props = {
  className?: string;
};

export function PosSidebarFooter({ className }: Props) {
  const [isClearModalOpen, setClearModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setCancelModalOpen] = useState<boolean>(false);

  const { language, availablePaymentMethods } = usePersistStore();

  // Debug logging
  console.log(
    "[POS-FOOTER] Available payment methods:",
    availablePaymentMethods
  );
  const { mutate: completePurchase, isPending: completingPurchase } =
    useCompleteTransaction();
  const {
    getTransactionAmountOverview,
    activeTransaction,
    clearTransactionItems,
    setActiveTransaction
  } = usePosStore();
  const amountOverview = getTransactionAmountOverview();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH
  );
  const [cashGiven, setCashGiven] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);

  useEffect(() => {
    if (availablePaymentMethods && availablePaymentMethods.length > 0) {
      // Set the first available payment method as default if current selection is not in the list
      if (!availablePaymentMethods.includes(paymentMethod)) {
        setPaymentMethod(availablePaymentMethods[0]);
      }
    } else {
      // Fallback to CASH if no payment methods are available
      setPaymentMethod(PaymentMethod.CASH);
    }
  }, [availablePaymentMethods, paymentMethod]);

  const handleCashGivenChange = (value: number | null) => {
    setCashGiven(value);

    if (value !== null) {
      setChange(value - amountOverview.total);
      return;
    }

    setChange(null);
  };

  const handleCompletePurchase = () => {
    // First, Update zustand store with payment method, cash given etc.
    setActiveTransaction({
      ...activeTransaction,
      paymentMethod: paymentMethod,
      cashReceived: cashGiven,
      changeGiven: change,
      subtotalAmount: amountOverview.subtotal,
      taxAmount: amountOverview.tax,
      totalAmount: amountOverview.total,
      discountAmount: amountOverview.discount
    });

    // Then, call mutate to complete the transaction
    completePurchase();
  };

  return (
    <div>
      <div
        className={cn(
          "space-y-2 z-40 shadow-[0px_-6px_12px_-10px_rgba(0,_0,_0,_0.1)]",
          className
        )}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <small>{TEXTS.posSidebar.subtotal[language]}</small>
            <small>{formatPrice(amountOverview.subtotal, language)}</small>
          </div>
          <div className="flex items-center justify-between">
            <small>{TEXTS.posSidebar.tax[language]}</small>
            <small>{formatPrice(amountOverview.tax, language)}</small>
          </div>
          <div className="flex items-center justify-between">
            <small>{TEXTS.posSidebar.discount[language]}</small>
            <small className="text-green-600">
              - {formatPrice(amountOverview.discount, language)}
            </small>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">
            {TEXTS.posSidebar.total[language]}
          </h4>
          <h4 className="text-lg font-semibold">
            {formatPrice(amountOverview.total, language)}
          </h4>
        </div>

        {/* Payment Methods List */}
        <div className="space-y-1">
          {availablePaymentMethods && availablePaymentMethods.length > 0 ? (
            <div
              className={cn("flex items-center gap-2", {
                "justify-center": availablePaymentMethods.length === 1
              })}
            >
              {availablePaymentMethods.length === 1 ? (
                // Single payment method - show as label/indicator
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Payment Method:</span>
                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-md">
                    {paymentMethod === PaymentMethod.CASH ? (
                      <BanknoteIcon className="w-4 h-4" />
                    ) : paymentMethod === PaymentMethod.CARD ? (
                      <CreditCardIcon className="w-4 h-4" />
                    ) : paymentMethod === PaymentMethod.LEND ? (
                      <HandCoinsIcon className="w-4 h-4" />
                    ) : null}
                    <span className="font-medium">
                      {(() => {
                        switch (paymentMethod) {
                          case PaymentMethod.CASH:
                            return TEXTS.posSidebar.methods.cash[language];
                          case PaymentMethod.CARD:
                            return TEXTS.posSidebar.methods.card[language];
                          case PaymentMethod.LEND:
                            return TEXTS.posSidebar.methods.lend[language];
                          default:
                            return paymentMethod;
                        }
                      })()}
                    </span>
                  </div>
                </div>
              ) : (
                // Multiple payment methods - show as buttons
                availablePaymentMethods.map((method) => {
                  const getMethodText = () => {
                    switch (method) {
                      case PaymentMethod.CASH:
                        return TEXTS.posSidebar.methods.cash[language];
                      case PaymentMethod.CARD:
                        return TEXTS.posSidebar.methods.card[language];
                      case PaymentMethod.LEND:
                        return TEXTS.posSidebar.methods.lend[language];
                      default:
                        return method;
                    }
                  };

                  return (
                    <Button
                      key={method}
                      variant={paymentMethod === method ? "default" : "outline"}
                      onClick={() => setPaymentMethod(method)}
                      icon={
                        method === PaymentMethod.CASH ? (
                          <BanknoteIcon />
                        ) : method === PaymentMethod.CARD ? (
                          <CreditCardIcon />
                        ) : method === PaymentMethod.LEND ? (
                          <HandCoinsIcon />
                        ) : undefined
                      }
                      className={cn(
                        "hover:text-foreground flex-1 shadow-none",
                        {
                          "bg-green-700 text-white hover:bg-green-800":
                            paymentMethod === method &&
                            method === PaymentMethod.CASH,
                          "bg-blue-700 text-white hover:bg-blue-800":
                            paymentMethod === method &&
                            method === PaymentMethod.CARD,
                          "bg-yellow-700 text-white hover:bg-yellow-800":
                            paymentMethod === method &&
                            method === PaymentMethod.LEND
                        }
                      )}
                      autoBlur
                    >
                      {getMethodText()}
                    </Button>
                  );
                })
              )}
            </div>
          ) : (
            // Fallback for empty payment methods
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-2 py-1 bg-secondary/50 rounded-md">
                <BanknoteIcon className="w-4 h-4" />
                <span>Cash Only</span>
              </div>
            </div>
          )}

          {paymentMethod === PaymentMethod.CASH && (
            <div className="flex items-center justify-between gap-3 mt-4 pb-1">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-foreground/80">
                  {TEXTS.posSidebar.cashGiven[language]}
                </Label>
                <Input
                  type="text"
                  placeholder={TEXTS.posSidebar.cashGiven[language]}
                  className="h-12 bg-white"
                  value={cashGiven ?? ""}
                  onChange={(e) => {
                    // Check if input is a character or number before updating state
                    if (/^[0-9]*$/.test(e.target.value)) {
                      if (e.target.value === "") {
                        handleCashGivenChange(null);
                        return;
                      }

                      handleCashGivenChange(Number(e.target.value));
                    }
                  }}
                  // Execute complete purchase on Enter key press
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCompletePurchase();
                    }
                  }}
                />
              </div>
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-foreground/80">
                  {TEXTS.posSidebar.balance[language]}
                </Label>
                <Input
                  type="number"
                  placeholder={TEXTS.posSidebar.balance[language]}
                  className="h-12 bg-white"
                  value={change ?? ""}
                  disabled
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full text-base"
            icon={<PrinterCheckIcon />}
            disabled={
              !activeTransaction ||
              amountOverview.total <= 0 ||
              (paymentMethod === PaymentMethod.CASH &&
                (!cashGiven || cashGiven < amountOverview.total))
            }
            onClick={handleCompletePurchase}
            loading={completingPurchase}
            autoBlur
          >
            {TEXTS.posSidebar.complete[language]}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1 shadow-none"
              icon={<EraserIcon />}
              onClick={() => setClearModalOpen(true)}
              autoBlur
            >
              {TEXTS.posSidebar.clear[language]}
            </Button>
            <Button
              variant="outline"
              className="flex-1 shadow-none"
              icon={<TrashIcon />}
              onClick={() => setCancelModalOpen(true)}
              autoBlur
            >
              {TEXTS.posSidebar.cancel[language]}
            </Button>
          </div>
        </div>
      </div>

      {/* Clear Alert */}
      <AlertDialog open={isClearModalOpen} onOpenChange={setClearModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will clear all items in the cart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearTransactionItems();
                // Auto-blur to prevent barcode scanner interference
                setTimeout(() => {
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                }, 100);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Modal */}
      <AlertDialog open={isCancelModalOpen} onOpenChange={setCancelModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will reset the current transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setActiveTransaction(null);
                clearTransactionItems();
                // Auto-blur to prevent barcode scanner interference
                setTimeout(() => {
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                }, 100);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
