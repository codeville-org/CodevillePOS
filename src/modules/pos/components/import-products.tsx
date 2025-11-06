import { ImportIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

type Props = {};

export function ImportProducts({}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          icon={<ImportIcon />}
          className="shadow-none h-9 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
        >
          Import Products
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
