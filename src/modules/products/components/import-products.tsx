import { ImportIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ImportProductsDialog } from "./import-products-dialog";

type Props = {};

export function ImportProducts({}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        icon={<ImportIcon />}
        className="shadow-none h-9 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
        onClick={() => setDialogOpen(true)}
      >
        Import Products
      </Button>

      <ImportProductsDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
