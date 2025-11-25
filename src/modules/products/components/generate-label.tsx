import { toPng } from "html-to-image";
import { Loader2, MapPinIcon, PhoneIcon, PrinterIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import Barcode from "react-barcode";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { useElectronAPI } from "@/hooks/use-electron-api";
import { cn, formatPrice } from "@/lib/utils";
import { InsertProductSchema } from "@/lib/zod/products.zod";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { useGetSettings } from "@/modules/settings/query/use-get";

type Props = {
  formValues: InsertProductSchema;
  children?: React.ReactNode;
};

export function GenerateLabelDialog({ formValues, children }: Props) {
  const { storeSettings } = usePersistStore();
  const electronAPI = useElectronAPI();
  const printToastId = useId();
  const labelRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [defaultLabelPrinter, setDefaultLabelPrinter] = useState<
    string | null
  >();

  const {
    data: allSettings,
    error: settingsError,
    isPending: loadingSettings
  } = useGetSettings();

  const barcode = formValues.barcode || null;

  useEffect(() => {
    if (allSettings) {
      setDefaultLabelPrinter(allSettings.defaultLabelPrinter || null);
    }
  }, [allSettings]);

  const handlePrintLabel = async (): Promise<string | null> => {
    if (labelRef.current === null) {
      console.error("Label reference is not available.");
      toast.error("Label generation failed: Reference not available");
      return null;
    }

    try {
      toast.loading("Generating label...", { id: printToastId });
      setIsPrinting(true);

      const dataUrl = await toPng(labelRef.current, {
        quality: 1,
        pixelRatio: 1, // Use 1:1 pixel ratio for thermal printing precision
        backgroundColor: "#ffffff",
        cacheBust: true,
        width: 638, // 80mm label width (638px at 203dpi)
        height: 400 // 50mm label height (400px at 203dpi) - common thermal label size
      });

      // Save label image
      const savedLabelImage = await electronAPI.images.saveImageFromBase64(
        dataUrl,
        false,
        true
      );

      console.log("Saved label image path:", savedLabelImage);
      toast.loading("Label generated, Printing in process...", {
        id: printToastId
      });

      // Implement printing logic here,
      const printResult = await electronAPI.print.printImageLabel(
        savedLabelImage,
        true
      );
      console.log("Print result:", printResult);

      toast.success("Label printed successfully!", { id: printToastId });
      return savedLabelImage;
    } catch (error) {
      console.error("Failed to generate label image:", error);
      toast.error(
        `Label printing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        { id: printToastId }
      );
      return null;
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Generate Product Label</DialogTitle>
          <DialogDescription>
            Preview and generate a thermal label for: Sample Product
          </DialogDescription>
        </DialogHeader>

        <div className="w-full flex items-center justify-center">
          {barcode ? (
            <div className="relative">
              {isPrinting && (
                <>
                  <div className="absolute top-0 left-0 w-full h-full z-40 bg-blue-600/10 backdrop-blur-xs flex items-center justify-center rounded-md">
                    <div className="p-3 w-fit h-fit rounded-full bg-blue-600/30 text-blue-600">
                      <PrinterIcon className="size-8 animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full z-50 flex items-center justify-center">
                    <Loader2 className="size-16 animate-spin text-blue-500" />
                  </div>
                </>
              )}

              {/* Label Preview */}
              <div className="border-2 border-dashed border-gray-300 rounded-md overflow-hidden">
                <div
                  ref={labelRef}
                  className={cn(
                    "w-[638px] h-[400px] p-4 bg-white box-border text-black font-sans flex flex-col items-center space-y-4 justify-between"
                  )}
                >
                  {/* Product Name */}
                  <div className="w-full px-3 py-0 text-center text-lg line-clamp-1 font-semibold rounded">
                    {formValues.name}
                  </div>

                  {/* Barcode - Optimized for thermal printing */}
                  <div className="flex items-center justify-center">
                    <Barcode
                      value={barcode}
                      width={3.3}
                      height={127}
                      fontSize={20}
                      margin={1}
                      background="#ffffff"
                      lineColor="#000000"
                      displayValue={true}
                    />
                  </div>

                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-1">
                      <div className="flex-1 px-3 py-2 space-y-0.5 border border-black rounded-sm">
                        <p className="text-sm">{`Unit`}</p>
                        <h1 className="text-lg font-black">{`${formValues.unitAmount} /${formValues.unit}`}</h1>
                      </div>
                      <div className="flex-1 px-3 py-2 space-y-0.5 border border-black rounded-sm">
                        <p className="text-sm">{`Unit Price`}</p>
                        <h1 className="text-lg font-black">{`${formatPrice(formValues.unitPrice)}`}</h1>
                      </div>
                    </div>

                    <div className="px-3 py-2 w-full space-y-2 border border-black rounded-sm">
                      <h1 className="font-black text-3xl">
                        {storeSettings.storeName}
                      </h1>

                      <div className="flex items-center gap-4">
                        <p className="text-black text-sm flex items-center gap-3">
                          <PhoneIcon className="size-4" />
                          {storeSettings.contactPhone}
                        </p>
                        <p className="text-black text-sm flex items-center gap-3">
                          <MapPinIcon className="size-4" />
                          {storeSettings.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-[638px] h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md">
              <p className="text-sm text-gray-500">
                No barcode available to generate label.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="w-full flex flex-row items-center justify-between">
          <p
            className={cn("flex-1 text-left text-sm flex items-center gap-2", {
              "text-amber-500": loadingSettings,
              "text-green-500": !loadingSettings && defaultLabelPrinter,
              "text-green-600": isPrinting,
              "text-red-500":
                !loadingSettings && !defaultLabelPrinter && settingsError
            })}
          >
            {loadingSettings ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PrinterIcon className="size-4" />
            )}

            {loadingSettings
              ? "Loading printer settings..."
              : settingsError
                ? settingsError.message
                : defaultLabelPrinter
                  ? `Label Printer: ${defaultLabelPrinter}`
                  : "No default label printer set in settings."}
          </p>

          <div className="flex items-center gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handlePrintLabel}
              disabled={!barcode || isPrinting}
              className="min-w-[120px]"
              loading={isPrinting}
              icon={<PrinterIcon />}
            >
              {isPrinting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Printing...
                </>
              ) : (
                "Print Label"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
