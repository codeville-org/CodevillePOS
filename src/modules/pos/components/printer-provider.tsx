import { toPng } from "html-to-image";
import {
  Calendar,
  Loader,
  Loader2,
  MapPinIcon,
  PhoneIcon,
  PrinterIcon,
  ReceiptIcon,
  UserIcon
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useElectronAPI } from "@/hooks/use-electron-api";
import { TEXTS } from "@/lib/language";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import {
  PaymentMethod,
  SelectTransactionSchema
} from "@/lib/zod/transactions.zod";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { usePrinterStore } from "@/lib/zustand/printer-store";
import ImageDisplay from "@/modules/image-manager/components/image-display";
import { useGetTransactionByID } from "@/modules/transactions/query/use-get-by-id";

type Props = {};

export function PrinterProvider({}: Props) {
  const { storeSettings, language } = usePersistStore();
  const electronAPI = useElectronAPI();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [transactionData, setTransactionData] =
    useState<SelectTransactionSchema | null>(null);
  const {
    currentItem,
    printerModalOpen,
    printerStatus,
    setPrinterModalOpen,
    setPrinterStatus
  } = usePrinterStore();
  const { mutateAsync: getTransactionByID } = useGetTransactionByID();

  useEffect(() => {
    if (currentItem && printerModalOpen) {
      handleFetchTransaction();
    }
  }, [currentItem, printerModalOpen]);

  const handleFetchTransaction = async () => {
    setIsFetching(true);

    await getTransactionByID(currentItem.transactionId, {
      onSuccess: async (data) => {
        setTransactionData(data);
        setIsFetching(false);

        // Open cash drawer after fetching transaction
        if (data.paymentMethod === PaymentMethod.CASH) {
          await electronAPI.print.openCashDrawer();
          toast.success("Cash drawer opened !");
        }
      },
      onSettled: () => {
        setIsFetching(false);
      }
    });
  };

  const handlePrint = async (): Promise<void> => {
    if (receiptRef.current === null) {
      console.error("Receipt reference is not available.");
      return;
    }

    try {
      setPrinterStatus("printing");

      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true
      });

      // Save bill image
      const savedBillImage = await electronAPI.images.saveImageFromBase64(
        dataUrl,
        true,
        false,
        transactionData?.transactionNumber
      );

      console.log("Saved bill image path:", savedBillImage);

      // Print bill image at full width (80mm thermal paper)
      console.log("Attempting to print bill image...");
      const printResult = await electronAPI.print.printImageBill(
        savedBillImage,
        true
      );
      console.log("Print result:", printResult);

      if (printResult.success) {
        toast.success("Transaction Bill Printed Successfully!");
      } else {
        console.error("Print failed:", printResult.error);
        toast.error(`Print failed: ${printResult.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to generate or print receipt image:", error);
      toast.error(
        `Print failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setPrinterStatus("idle");
    }
  };

  if (currentItem && printerModalOpen)
    return (
      <Dialog
        open={printerModalOpen}
        onOpenChange={(open) => setPrinterModalOpen(open)}
      >
        <DialogContent className="min-w-fit">
          <DialogHeader>
            <DialogTitle>Do you need a receipt?</DialogTitle>
            <DialogDescription>
              You can print a receipt from completed transaction or ignore.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full flex items-center justify-center">
            {isFetching ? (
              <Card
                className={`w-[576px] h-80 flex items-center justify-center`}
              >
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Loader className="size-6 animate-spin" />
                </div>
              </Card>
            ) : transactionData ? (
              <div
                className={
                  "w-[576px] min-h-[300px] relative overflow-hidden rounded-md"
                }
              >
                {printerStatus === "printing" && (
                  <>
                    <div className="absolute top-0 left-0 w-full h-full z-40 bg-green-600/40 backdrop-blur-xs flex items-center justify-center">
                      <div className="p-5 w-fit h-fit rounded-full bg-amber-600/50 text-green-600">
                        <PrinterIcon className="size-12 animate-pulse" />
                      </div>
                    </div>

                    <div className="absolute top-0 left-0 w-full h-full z-50 flex items-center justify-center">
                      <Loader2 className=" size-28 animate-spin text-green-500" />
                    </div>
                  </>
                )}

                <ScrollArea className="h-[70vh] border border-foreground/80 rounded-xl overflow-hidden">
                  <div
                    ref={receiptRef}
                    className={cn(
                      "w-[576px] p-4 bg-white box-border text-black font-sans pb-8",
                      {
                        "font-sinhala": language === "si"
                      }
                    )}
                  >
                    {/* Store Logo */}
                    <div className="w-full flex items-center justify-center h-fit">
                      {storeSettings.storeLogo ? (
                        <ImageDisplay
                          filename={storeSettings.storeLogo}
                          className="w-full max-w-[420px] object-cover"
                        />
                      ) : (
                        <h1 className="text-2xl font-black font-sans">
                          CodeVille POS
                        </h1>
                      )}
                    </div>

                    <div className="text-center flex items-center justify-center flex-col">
                      {/*
                        <h1 className="text-2xl font-black">
                          {storeSettings?.storeName || "My Store"}
                        </h1>
                      */}

                      <p className="text-xl font-semibold mt-2 flex items-center gap-2">
                        <MapPinIcon className="size-5" />
                        {storeSettings?.address || "Address Placeholder"}
                      </p>

                      <p className="text-xl font-semibold mt-1 flex items-center gap-2">
                        <PhoneIcon className="size-5" />
                        {storeSettings?.contactPhone || "Contact Number"}
                      </p>
                    </div>

                    {/* Transactions Items Table */}
                    <div className="my-5">
                      {/* --- Table Header --- */}
                      <div className="mb-0 bg-gray-300 border-b border-black p-4 space-y-2">
                        <p className="text-base font-semibold mt-1 flex items-center gap-2">
                          <ReceiptIcon className="size-5" />
                          {TEXTS.bill.billNumber[language]}:{" "}
                          <span className="font-normal">
                            {transactionData.transactionNumber}
                          </span>
                        </p>

                        <p className="text-base font-semibold mt-1 flex items-center gap-2">
                          <Calendar className="size-5" />
                          {TEXTS.bill.invoiceData[language]}:{" "}
                          <span className="font-normal">
                            {formatDate(new Date(transactionData.createdAt))}
                          </span>
                        </p>

                        {transactionData.customer && (
                          <p className="text-base font-semibold mt-1 flex items-center gap-2">
                            <UserIcon className="size-5" />
                            {TEXTS.bill.customer[language]}:{" "}
                            <span className="font-normal">
                              {transactionData.customer.name}
                            </span>
                          </p>
                        )}
                      </div>
                      <div
                        className={cn(
                          "w-full h-12 mb-3 flex items-center justify-between bg-gray-300 text-black text-lg",
                          {
                            "font-semibold": language === "en"
                          }
                        )}
                      >
                        <div className="flex-1 w-full px-6 text-center">
                          {TEXTS.bill.qty[language]}
                        </div>
                        <div className="flex-1 w-full px-6 text-center border-x-2 border-black">
                          {TEXTS.bill.unitPrice[language]}
                        </div>
                        <div className="flex-1 w-full px-6 text-right">
                          {TEXTS.bill.total[language]}
                        </div>
                      </div>

                      {/* Table Body */}
                      {transactionData.items.map((item, index) => (
                        <div
                          key={index}
                          className={
                            "space-y-2 pb-1 border-b border-gray-400 mb-3"
                          }
                        >
                          <p className="w-full line-clamp-1 text-xl font-semibold text-black">
                            {`${index + 1}. `} {item.productName}
                          </p>

                          <div
                            className={cn(
                              "w-full h-fit flex items-center justify-between text-xl text-black"
                            )}
                          >
                            <div className="flex-1 w-full px-6 text-center">
                              {item.quantity} {item.unit}
                            </div>
                            <div className="flex-1 w-full px-6 text-center border-x-2 border-gray-400">
                              {formatPrice(item.unitPrice, language)}
                            </div>
                            <div className="flex-1 w-full px-6 text-right">
                              {formatPrice(item.totalAmount, language)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Amount Section */}
                    <div className="my-3 py-3 border-y-2 border-black flex flex-col gap-3">
                      {transactionData.discountAmount > 0 && (
                        <>
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-semibold">
                              {TEXTS.bill.subtotal[language]}:{" "}
                            </p>
                            <span className="font-normal text-xl">
                              {formatPrice(
                                transactionData.subtotalAmount,
                                language
                              )}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xl font-semibold">
                              {TEXTS.bill.discount[language]}:{" "}
                            </p>
                            <span className="font-normal text-xl">
                              {`-`}{" "}
                              {formatPrice(
                                transactionData.discountAmount,
                                language
                              )}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-3xl font-semibold">
                          {TEXTS.bill.netTotal[language]}:{" "}
                        </p>
                        <p className="text-4xl font-black">
                          {formatPrice(transactionData.totalAmount, language)}
                        </p>
                      </div>

                      <div className="mt-3 border-t border-black py-3 flex items-center justify-between">
                        <p className="text-xl font-semibold">
                          {TEXTS.bill.cashGiven[language]} :{" "}
                          <p className="font-medium">
                            {formatPrice(
                              transactionData.cashReceived,
                              language
                            )}
                          </p>
                        </p>
                        <p className="text-xl font-semibold">
                          {TEXTS.bill.balance[language]} :{" "}
                          <p className="font-medium">
                            {formatPrice(transactionData.changeGiven, language)}
                          </p>
                        </p>
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="mt-6 mb-2">
                      <p className="text-center text-2xl">
                        {TEXTS.bill.greetings[language]}
                      </p>

                      <div className="py-8 text-center flex items-center flex-col justify-center space-y-3">
                        <h1 className="text-xl">
                          Software Developed by. CodeVille
                        </h1>
                        <p className="text-lg font-semibold flex items-center gap-2">
                          <PhoneIcon className="size-5" />
                          {"+9470 584 8028 / +9472 798 2280"}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <>
                <p className="text-center text-sm text-muted-foreground">
                  No transaction data available.
                </p>
              </>
            )}
          </div>

          <DialogFooter className="flex items-center gap-3">
            <DialogClose asChild className="flex-1 w-full">
              <Button variant="outline">Skip</Button>
            </DialogClose>

            <Button
              variant="default"
              className="flex-1 w-full"
              onClick={handlePrint}
            >
              Print Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

  return null;
}
