import { FileUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {};

export function ExportProducts({}: Props) {
  return (
    <Button
      variant="default"
      icon={<FileUpIcon />}
      className="shadow-none h-9 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
    >
      Export Products
    </Button>
  );
}
