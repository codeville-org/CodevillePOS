import { BarcodeIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useBarcodeReader } from "@/hooks/use-barcode-reader";
import { useElectronAPI } from "@/hooks/use-electron-api";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface BarcodeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onScan?: (barcode: string) => void;
  onGenerate?: (barcode: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  enableScanning?: boolean;
  enableSimulation?: boolean;
  simulationShortcut?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    key: string;
  };
  showScanButton?: boolean;
  showGenerateButton?: boolean;
  showStatusIndicator?: boolean;
}

export function BarcodeInput({
  value = "",
  onChange,
  onScan,
  onGenerate,
  placeholder = "Enter or scan barcode...",
  className,
  disabled = false,
  enableScanning = true,
  enableSimulation = true,
  simulationShortcut = { ctrl: true, shift: true, key: "B" },
  showGenerateButton = true
  // showStatusIndicator = true
}: BarcodeInputProps) {
  const api = useElectronAPI();
  const [generating, setGenerating] = useState(false);

  const [isFocused, setIsFocused] = useState(false);
  const [recentlyScanned, setRecentlyScanned] = useState(false);
  const [recentlyGenerated, setRecentlyGenerated] = useState(false);

  const { isScanning, lastScannedBarcode } = useBarcodeReader({
    enabled: enableScanning && !disabled,
    simulationEnabled: enableSimulation,
    simulationShortcut,
    onScan: (barcode) => {
      onChange?.(barcode);
      onScan?.(barcode);
      setRecentlyScanned(true);

      // Clear the "recently scanned" state after 3 seconds
      setTimeout(() => setRecentlyScanned(false), 3000);
    },
    onError: (error) => {
      console.warn("Barcode scan error:", error);
    }
  });

  // Update input when barcode is scanned
  useEffect(() => {
    if (lastScannedBarcode && enableScanning) {
      onChange?.(lastScannedBarcode);
    }
  }, [lastScannedBarcode, enableScanning, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
    setRecentlyScanned(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent Enter key from submitting forms accidentally
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const generateBarcode = async () => {
    setGenerating(true);
    const generatedBarcodeRes = await api.products.generateBarcode();

    if (!generatedBarcodeRes.success || !generatedBarcodeRes?.data) {
      console.error("Failed to generate barcode:", generatedBarcodeRes?.error);
      return;
    }

    const generatedBarcode = generatedBarcodeRes?.data?.barcode;

    onChange?.(generatedBarcode);
    onGenerate?.(generatedBarcode);

    setGenerating(false);

    // Show feedback
    setRecentlyGenerated(true);
    setTimeout(() => setRecentlyGenerated(false), 2000);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative space-x-2 flex items-center rounded-md border transition-all duration-200",
          {
            "border-blue-500 ring-2 ring-blue-500/20":
              isFocused &&
              !isScanning &&
              !recentlyScanned &&
              !recentlyGenerated,
            "border-orange-500 ring-2 ring-orange-500/20 bg-orange-50 dark:bg-orange-900/10":
              isScanning,
            "border-green-500 ring-2 ring-green-500/20 bg-green-50 dark:bg-green-900/10":
              recentlyScanned || recentlyGenerated,
            "border-input":
              !isFocused &&
              !isScanning &&
              !recentlyScanned &&
              !recentlyGenerated,
            "opacity-50 cursor-not-allowed": disabled
          }
        )}
      >
        <Input
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            isScanning
              ? "Scanning..."
              : recentlyScanned
                ? "Barcode scanned successfully!"
                : recentlyGenerated
                  ? "Barcode generated successfully!"
                  : placeholder
          }
          disabled={disabled}
          className={cn(
            "border-0 w-full h-12 bg-white shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
            {
              "text-orange-700 dark:text-orange-300": isScanning,
              "text-green-700 dark:text-green-300":
                recentlyScanned || recentlyGenerated
            }
          )}
        />

        {showGenerateButton && (
          <div className="pr-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={<BarcodeIcon />}
              onClick={generateBarcode}
              disabled={disabled || generating}
              title="Generate unique barcode"
              loading={generating}
            >
              Generate
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
