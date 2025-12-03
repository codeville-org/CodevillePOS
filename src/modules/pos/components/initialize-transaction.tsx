import { CircleDollarSignIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TEXTS } from "@/lib/language";
import { cn } from "@/lib/utils";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { usePosStore } from "@/lib/zustand/pos-store";
import { useInitializeTransaction } from "../queries/use-initialize-transaction";

type Props = {
  className?: string;
  variant?: string;
};

export function InitializeTransaction({
  className,
  variant = "default"
}: Props) {
  const { language } = usePersistStore();
  const { activeTransaction } = usePosStore();
  const { mutate, isPending } = useInitializeTransaction();

  const handleInitialize = () => {
    mutate();
  };

  if (activeTransaction) return null;

  return (
    <Button
      onClick={handleInitialize}
      loading={isPending}
      variant={(variant as any) || "default"}
      icon={<CircleDollarSignIcon />}
      className={cn(className, "rounded-full shadow-none", {
        "hover:text-foreground": variant === "outline"
      })}
      autoBlur
    >
      {TEXTS.pos.newTransaction[language]}
    </Button>
  );
}
