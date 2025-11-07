import { ImportIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useImportProducts, useSelectImportFile } from "../queries/use-import";

type Props = {};

export function ImportProducts({}: Props) {
  const { mutateAsync: selectFile, isPending: isSelectingFile } =
    useSelectImportFile();
  const { mutateAsync: importProducts, isPending: isImporting } =
    useImportProducts();

  const handleImport = async () => {
    try {
      // First, open file dialog to select CSV file
      const fileResult = await selectFile();

      if (fileResult.success && fileResult.filePath) {
        // Then import the selected file
        await importProducts({ filePath: fileResult.filePath });
      }
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const isLoading = isSelectingFile || isImporting;

  return (
    <Button
      variant="secondary"
      icon={<ImportIcon />}
      className="shadow-none h-9 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
      onClick={handleImport}
      loading={isLoading}
      disabled={isLoading}
    >
      Import Products
    </Button>
  );
}
