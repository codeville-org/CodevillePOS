import { FileUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useExportProducts } from "../queries/use-export";

type Props = {};

export function ExportProducts({}: Props) {
  const { mutateAsync: exportProducts, isPending } = useExportProducts();

  const handleExport = async () => {
    try {
      await exportProducts();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Button
      variant="default"
      icon={<FileUpIcon />}
      className="shadow-none h-9 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
      onClick={handleExport}
      loading={isPending}
      disabled={isPending}
    >
      Export Products
    </Button>
  );
}
