import { CheckCircle2Icon, ScanBarcodeIcon, XCircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { cn, playBeep } from "@/lib/utils";

import { UninitializedTransactionItem } from "@/lib/zod/transactions.zod";
import { usePosStore } from "@/lib/zustand/pos-store";
import { useGetProductByBarcode } from "@/modules/products/queries/use-get-by-barcode";

type Props = {
  minimal?: boolean;
};

const SIMULATE_BARCODES = [
  "4354555342454",
  "353498283413",
  "56649324952",
  "560039555523",
  "53434234",
  "4534699344"
];

export function BarcodeReaderStatusBadge({ minimal = false }: Props) {
  const location = useLocation();
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "scanning"
  >("connected");
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  // Early return if on products page - avoid setting up hooks
  const isOnProductsPage = location.pathname.startsWith("/products/");

  const { activeTransaction, addTransactionItem, setLastScannedProduct } =
    usePosStore();

  // Barcode detection state
  const barcodeBufferRef = useRef<string>("");
  const lastKeypressTimeRef = useRef<number>(0);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Query to fetch product by barcode
  const {
    data: scannedProduct,
    isError,
    isSuccess
  } = useGetProductByBarcode(scannedBarcode);

  // Handle scanned product
  useEffect(() => {
    if (scannedProduct && scannedBarcode && isSuccess && activeTransaction) {
      // Set the last scanned product for display in search input
      setLastScannedProduct({
        id: scannedProduct.id,
        name: scannedProduct.name,
        barcode: scannedProduct.barcode || scannedBarcode,
        timestamp: Date.now()
      });

      const item: UninitializedTransactionItem = {
        productId: scannedProduct.id,
        productName: scannedProduct.name,
        productBarcode: scannedProduct.barcode || "",
        unitPrice: scannedProduct.unitPrice,
        ourPrice:
          scannedProduct.discountedPrice > scannedProduct?.unitPrice
            ? scannedProduct.unitPrice
            : scannedProduct.discountedPrice,
        quantity: scannedProduct.unitAmount,
        unit: scannedProduct.unit,
        unitAmount: scannedProduct.unitAmount,
        totalAmount:
          scannedProduct.discountedPrice > 0
            ? scannedProduct.discountedPrice
            : scannedProduct.unitPrice,
        discountAmount:
          scannedProduct.unitPrice > scannedProduct.discountedPrice
            ? scannedProduct.unitPrice - scannedProduct.discountedPrice
            : 0
      };

      addTransactionItem(item);

      playBeep(800, 0.1);

      toast.success(`Added: ${scannedProduct.name}`);

      setScannedBarcode(null);

      setTimeout(() => {
        setStatus("connected");
      }, 500);
    }
  }, [
    scannedProduct,
    scannedBarcode,
    activeTransaction,
    isSuccess,
    addTransactionItem,
    setLastScannedProduct
  ]);

  useEffect(() => {
    if (isError && scannedBarcode) {
      playBeep(400, 0.2);

      toast.error("Product not found", {
        description: `Barcode: ${scannedBarcode}`
      });

      setScannedBarcode(null);
      setStatus("connected");
    }
  }, [isError, scannedBarcode]);

  // Function to simulate a random barcode scan
  const simulateBarcodeScan = () => {
    const randomBarcode =
      SIMULATE_BARCODES[Math.floor(Math.random() * SIMULATE_BARCODES.length)];

    setStatus("scanning");

    // Simulate scanning delay
    setTimeout(() => {
      setScannedBarcode(randomBarcode);
      setStatus("connected");
    }, 600); // 600ms delay
  };

  // Add global method for testing (temporary)
  useEffect(() => {
    // Don't set up global test method if on products page
    if (isOnProductsPage) return;

    (window as any).testBarcodeSimulation = simulateBarcodeScan;
    return () => {
      delete (window as any).testBarcodeSimulation;
    };
  }, [isOnProductsPage]);

  // Global keypress listener for barcode scanner
  useEffect(() => {
    // Don't set up global listeners if on products page
    if (isOnProductsPage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl + Shift + S for barcode simulation
      // Try both e.key === "S" and e.code === "KeyS" for better compatibility
      if (e.ctrlKey && e.shiftKey && (e.key === "S" || e.code === "KeyS")) {
        e.preventDefault();
        e.stopPropagation();

        simulateBarcodeScan();
        return;
      }

      // Ignore if user is typing in form elements or interacting with UI controls
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.tagName === "BUTTON" ||
        target.isContentEditable ||
        // Check for form controls and interactive elements
        target.closest('[role="combobox"]') ||
        target.closest('[role="listbox"]') ||
        target.closest('[role="option"]') ||
        target.closest('[role="button"]') ||
        target.closest("[data-radix-collection-item]") ||
        target.closest("[data-radix-select-trigger]") ||
        target.closest("[data-radix-select-content]") ||
        target.closest("[data-radix-dropdown-menu]") ||
        target.closest("[tabindex]") ||
        target.hasAttribute("tabindex") ||
        target.getAttribute("role") === "button" ||
        target.getAttribute("role") === "combobox" ||
        target.getAttribute("role") === "listbox"
      ) {
        return;
      }

      // Auto-blur buttons and focusable elements when barcode scanning starts
      const activeElement = document.activeElement as HTMLElement;
      if (
        activeElement &&
        activeElement !== document.body &&
        (activeElement.tagName === "BUTTON" ||
          activeElement.hasAttribute("tabindex") ||
          activeElement.getAttribute("role") === "button" ||
          activeElement.closest('[role="button"]'))
      ) {
        // Blur the focused element to prevent interference
        activeElement.blur();
        // Small delay to ensure blur takes effect
        setTimeout(() => {
          // Continue with barcode processing
          if (
            e.key !== "Enter" &&
            e.key.length === 1 &&
            !e.ctrlKey &&
            !e.altKey &&
            !e.metaKey
          ) {
            const now = Date.now();
            const timeSinceLastKey = now - lastKeypressTimeRef.current;

            if (timeSinceLastKey > 200) {
              barcodeBufferRef.current = "";
            }

            lastKeypressTimeRef.current = now;

            if (scanTimeoutRef.current) {
              clearTimeout(scanTimeoutRef.current);
            }

            barcodeBufferRef.current += e.key;
            setStatus("scanning");

            if (inactivityTimeoutRef.current) {
              clearTimeout(inactivityTimeoutRef.current);
            }

            scanTimeoutRef.current = setTimeout(() => {
              const barcode = barcodeBufferRef.current.trim();
              if (barcode.length >= 3) {
                setScannedBarcode(barcode);
                setStatus("connected");
              } else {
                setStatus("connected");
              }
              barcodeBufferRef.current = "";
            }, 50);
          }
        }, 10);
        return;
      }

      // Special handling for space key - often used for UI interactions
      if (e.key === " ") {
        if (
          activeElement &&
          (activeElement.tagName === "BUTTON" ||
            activeElement.hasAttribute("tabindex") ||
            activeElement.getAttribute("role") === "button" ||
            activeElement.getAttribute("role") === "combobox" ||
            activeElement.closest('[role="combobox"]') ||
            activeElement.closest("[data-radix-select-trigger]"))
        ) {
          return;
        }
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeypressTimeRef.current;

      // If this is the start of a new scan (> 200ms since last key)
      if (timeSinceLastKey > 200) {
        barcodeBufferRef.current = "";
      }

      lastKeypressTimeRef.current = now;

      // Clear existing timeout
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      // Add character to buffer (ignore Enter and modifier keys)
      if (
        e.key !== "Enter" &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey
      ) {
        barcodeBufferRef.current += e.key;

        // Set status to scanning
        setStatus("scanning");

        // Clear inactivity timeout
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
      }

      // Process barcode when Enter is pressed or after rapid input
      scanTimeoutRef.current = setTimeout(() => {
        const barcode = barcodeBufferRef.current.trim();

        if (barcode.length >= 3) {
          // Valid barcode detected
          setScannedBarcode(barcode);
          setStatus("connected");
        } else {
          setStatus("connected");
        }

        barcodeBufferRef.current = "";
      }, 50); // 50ms timeout for rapid scanner input
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [isOnProductsPage]);

  // Return empty if on products page
  if (isOnProductsPage) return <></>;

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-9 flex items-center gap-2 px-3 py-2 font-sans rounded-full transition-all duration-200",
        {
          "bg-green-600/10 hover:bg-green-600/20 border border-green-600/30 text-green-600":
            status === "connected",
          "bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/40 text-orange-600":
            status === "scanning",
          "bg-zinc-600/10 hover:bg-zinc-600/20 text-zinc-600 border-zinc-600/30":
            status === "disconnected"
        }
      )}
    >
      <div className="relative">
        <ScanBarcodeIcon className="size-5" />

        {status === "connected" && (
          <>
            <div className="absolute z-30 -bottom-1 -right-1 w-fit h-fit bg-green-500 flex items-center justify-center rounded-full">
              <CheckCircle2Icon className="size-3 text-white" />
            </div>
            <div className="absolute z-10 rounded-full -bottom-[3px] -right-[3px] size-[10px] bg-green-500 animate-ping" />
          </>
        )}

        {status === "scanning" && (
          <>
            <div className="absolute z-30 -bottom-1 -right-1 w-fit h-fit bg-orange-500 flex items-center justify-center rounded-full">
              <div className="size-2 bg-white rounded-full animate-pulse" />
            </div>
            <div className="absolute z-10 rounded-full -bottom-[3px] -right-[3px] size-[10px] bg-orange-500 animate-ping" />
          </>
        )}

        {status === "disconnected" && (
          <div className="absolute z-30 -bottom-1 -right-1 w-fit h-fit bg-red-500 flex items-center justify-center rounded-full">
            <XCircleIcon className="size-3 text-white" />
          </div>
        )}
      </div>

      {!minimal && (
        <span className="font-sans text-xs font-medium">
          {status === "connected" && "Scanner Ready"}
          {status === "scanning" && "Scanning..."}
          {status === "disconnected" && "Scanner Inactive"}
        </span>
      )}
    </Badge>
  );
}
