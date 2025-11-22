import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/lib/zod/transactions.zod";
import { CheckCircle2Icon } from "lucide-react";
import { useGetSettings } from "../query/use-get";
import { useUpsertSettings } from "../query/use-upsert";

type Props = {};

const paymentMethods = Object.values(PaymentMethod);

export function PaymentMethodsManagement({}: Props) {
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const { mutate, isPending: isUpserting } = useUpsertSettings();
  const { data: settings, isPending } = useGetSettings();

  // Initialize selectedMethods with current settings
  useEffect(() => {
    if (settings?.availablePaymentMethods) {
      // Remove duplicates and ensure we only have valid PaymentMethod values
      const uniqueMethods = Array.from(
        new Set(settings.availablePaymentMethods)
      ).filter((method) =>
        Object.values(PaymentMethod).includes(method as PaymentMethod)
      );
      console.log("[PAYMENT-METHODS] Setting selected methods:", uniqueMethods);
      setSelectedMethods(uniqueMethods as PaymentMethod[]);
    }
  }, [settings]);

  const handleUpsertMethods = async () => {
    // Remove duplicates before saving
    const uniqueMethods = Array.from(new Set(selectedMethods));
    console.log("[PAYMENT-METHODS] Saving methods:", uniqueMethods);

    mutate({
      availablePaymentMethods: uniqueMethods
    });
  };

  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Manage your payment methods used in the POS system.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="w-full flex items-center gap-3">
          {isPending
            ? Array(4)
                .fill(0)
                .map((_, idx) => <Skeleton key={idx} className="h-10 w-24" />)
            : paymentMethods.map((method) => {
                const isSelected = selectedMethods.includes(method);

                const getMethodLabel = (method: PaymentMethod) => {
                  switch (method) {
                    case PaymentMethod.CASH:
                      return "CASH";
                    case PaymentMethod.CARD:
                      return "CARD";
                    case PaymentMethod.LEND:
                      return "LEND";
                    default:
                      return (method as string).toUpperCase();
                  }
                };

                return (
                  <Button
                    key={method}
                    className={cn({
                      "bg-primary text-primary-foreground": isSelected,
                      "bg-secondary/70 border border-border text-secondary-foreground hover:bg-secondary/80":
                        !isSelected
                    })}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMethods(
                          selectedMethods.filter((m) => m !== method)
                        );
                      } else {
                        setSelectedMethods([...selectedMethods, method]);
                      }
                    }}
                    icon={isSelected ? <CheckCircle2Icon /> : undefined}
                  >
                    {getMethodLabel(method)}
                  </Button>
                );
              })}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleUpsertMethods}
          loading={isUpserting}
          disabled={isUpserting}
        >
          Update
        </Button>
      </CardFooter>
    </Card>
  );
}
