import {
  CheckCircle2Icon,
  FileIcon,
  FolderIcon,
  ImageIcon
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  useCopyImagesFromDirectory,
  useListImagesInDirectory,
  useSelectImageDirectory
} from "../queries/use-image-directory";
import { useImportProducts, useSelectImportFile } from "../queries/use-import";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportProductsDialog({ open, onOpenChange }: Props) {
  const [selectedImageDirectory, setSelectedImageDirectory] = useState<
    string | null
  >(null);
  const [selectedCsvFile, setSelectedCsvFile] = useState<string | null>(null);
  const [imagesList, setImagesList] = useState<string[]>([]);

  // Hooks
  const { mutateAsync: selectImageDirectory, isPending: isSelectingImageDir } =
    useSelectImageDirectory();
  const { mutateAsync: listImages, isPending: isListingImages } =
    useListImagesInDirectory();
  const { mutateAsync: selectCsvFile, isPending: isSelectingCsv } =
    useSelectImportFile();
  const { mutateAsync: copyImages, isPending: isCopyingImages } =
    useCopyImagesFromDirectory();
  const { mutateAsync: importProducts, isPending: isImporting } =
    useImportProducts();

  // Handle selecting image directory
  const handleSelectImageDirectory = async () => {
    try {
      const result = await selectImageDirectory();

      if (result.success && result.directoryPath) {
        setSelectedImageDirectory(result.directoryPath);

        // List images in the selected directory
        const listResult = await listImages(result.directoryPath);

        if (listResult.success && listResult.images) {
          setImagesList(listResult.images);
          toast.success(
            `Found ${listResult.images.length} images in directory`
          );
        }
      }
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  // Handle selecting CSV file
  const handleSelectCsvFile = async () => {
    try {
      const result = await selectCsvFile();

      if (result.success && result.filePath) {
        setSelectedCsvFile(result.filePath);
        toast.success("CSV file selected successfully");
      }
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  // Handle continue button
  const handleContinue = async () => {
    // Validate that CSV file is selected
    if (!selectedCsvFile) {
      toast.error("Please select a CSV file to continue");
      return;
    }

    try {
      // Step 1: Copy images if directory is selected
      if (selectedImageDirectory) {
        await copyImages(selectedImageDirectory);
      }

      // Step 2: Import products from CSV
      await importProducts({ filePath: selectedCsvFile });

      // Success - close dialog and reset state
      onOpenChange(false);
      resetState();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  // Reset state
  const resetState = () => {
    setSelectedImageDirectory(null);
    setSelectedCsvFile(null);
    setImagesList([]);
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const isLoading =
    isSelectingImageDir ||
    isListingImages ||
    isSelectingCsv ||
    isCopyingImages ||
    isImporting;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Select an image directory (optional) and a CSV file to import
            products.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Image Directory Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Image Directory (Optional)
            </label>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="outline"
                icon={<FolderIcon />}
                onClick={handleSelectImageDirectory}
                disabled={isLoading}
                loading={isSelectingImageDir || isListingImages}
                className="flex-1"
              >
                {selectedImageDirectory
                  ? "Change Image Directory"
                  : "Select Image Directory"}
              </Button>
              {selectedImageDirectory && (
                <CheckCircle2Icon className="size-5 text-green-600 flex-shrink-0" />
              )}
            </div>

            {/* Display selected directory path */}
            {selectedImageDirectory && (
              <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md break-all">
                {selectedImageDirectory}
              </div>
            )}

            {/* Display images list */}
            {imagesList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Found Images ({imagesList.length})
                  </span>
                </div>
                <ScrollArea className="h-32 border rounded-md p-2 bg-secondary/20">
                  <div className="grid grid-cols-2 gap-2">
                    {imagesList.map((image, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs bg-background p-2 rounded border"
                      >
                        <ImageIcon className="size-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{image}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <Separator />

          {/* CSV File Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              CSV File <span className="text-destructive">*</span>
            </label>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="outline"
                icon={<FileIcon />}
                onClick={handleSelectCsvFile}
                disabled={isLoading}
                loading={isSelectingCsv}
                className="flex-1"
              >
                {selectedCsvFile ? "Change CSV File" : "Select CSV File"}
              </Button>
              {selectedCsvFile && (
                <CheckCircle2Icon className="size-5 text-green-600 flex-shrink-0" />
              )}
            </div>

            {/* Display selected CSV file path */}
            {selectedCsvFile && (
              <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md break-all">
                {selectedCsvFile}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => handleDialogClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isLoading || !selectedCsvFile}
            loading={isCopyingImages || isImporting}
          >
            Continue Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
