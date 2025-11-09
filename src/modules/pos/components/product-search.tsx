import { CheckCircleIcon, SearchIcon } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";
import { usePosStore } from "@/lib/zustand/pos-store";

type Props = {
  className?: string;
};

export function ProductSearchInput({ className }: Props) {
  const {
    searchTerm,
    setSearchTerm,
    lastScannedProduct,
    setLastScannedProduct,
    setFilter
  } = usePosStore();

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);

    // Clear the last scanned product when user starts typing manually
    if (e.target.value && lastScannedProduct) {
      setLastScannedProduct(null);
    }

    // Clear category filter when user starts typing to show all products
    if (e.target.value) {
      setFilter("all");
    }
  };

  useEffect(() => {
    // If search term is cleared, set filter to "featured" after a short delay
    if (!searchTerm) {
      const timer = setTimeout(() => {
        setFilter("featured");
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // Display scanned product name when product was scanned
  const displayValue =
    lastScannedProduct && !searchTerm
      ? lastScannedProduct.name
      : searchTerm || "";

  const isShowingScannedProduct = lastScannedProduct && !searchTerm;

  // Auto-clear scanned product after 5 seconds to restore normal input functionality
  useEffect(() => {
    if (lastScannedProduct && !searchTerm) {
      const timer = setTimeout(() => {
        setLastScannedProduct(null);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [lastScannedProduct, searchTerm, setLastScannedProduct]);

  // Dynamic placeholder based on state
  const getPlaceholder = () => {
    if (isShowingScannedProduct) {
      return "Scanned product - start typing to search manually";
    }
    return "Search by product name or barcode...";
  };

  return (
    <div
      className={cn(
        "h-14 border border-foreground/5 rounded-md bg-secondary/30 flex items-center justify-between overflow-hidden transition-all duration-200",
        {
          "border-green-500/30 bg-green-50 dark:bg-green-900/10 cursor-not-allowed pointer-events-none":
            isShowingScannedProduct
        },
        className
      )}
    >
      <div className="h-full w-14 flex items-center justify-center">
        {isShowingScannedProduct ? (
          <CheckCircleIcon className="size-7 text-green-600" />
        ) : (
          <SearchIcon className="size-7 text-foreground/30" />
        )}
      </div>
      <input
        placeholder={getPlaceholder()}
        className={cn(
          "border-none h-full w-full flex-1 bg-transparent transition-colors duration-200",
          {
            "text-green-700 dark:text-green-400 font-medium":
              isShowingScannedProduct
          }
        )}
        value={displayValue}
        onChange={handleSearchTermChange}
        autoFocus
      />
    </div>
  );
}
