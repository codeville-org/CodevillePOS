import { Loader, XIcon } from "lucide-react";
import { useState } from "react";

import { Pagination } from "@/components/layouts/dashboard/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SelectProductSchema } from "@/lib/zod/products.zod";
import { UninitializedTransactionItem } from "@/lib/zod/transactions.zod";
import { usePosStore } from "@/lib/zustand/pos-store";
import { ProductItem } from "@/modules/products/components/product-item";
import { useGetAllProducts } from "@/modules/products/queries/use-get-all";

type Props = { className?: string };

export function PosProductsListing({ className }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const { filter, searchTerm, addTransactionItem, activeTransaction } =
    usePosStore();

  const filterCategory = typeof filter === "string" ? null : filter.id;

  const { data, isLoading, error } = useGetAllProducts({
    page: currentPage.toString(),
    limit: itemsPerPage.toString(),
    search: searchTerm || "",
    featured: filter === "featured",
    category: filterCategory
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddToCart = (product: SelectProductSchema) => {
    if (!activeTransaction) return;

    // Check if product is in stock
    if (product.stockQuantity <= 0) {
      // Could show a toast notification here
      return;
    }

    const item: UninitializedTransactionItem = {
      productId: product.id,
      productName: product.name,
      productBarcode: product.barcode || "",
      unitPrice:
        product.discountedPrice > 0
          ? product.discountedPrice
          : product.unitPrice,
      quantity: product.unitAmount,
      unit: product.unit,
      unitAmount: product.unitAmount,
      totalAmount:
        product.discountedPrice > 0
          ? product.discountedPrice
          : product.unitPrice,
      discountAmount: 0
    };

    addTransactionItem(item);
  };

  return (
    <div
      className={cn(
        "flex-1 flex flex-col h-full bg-secondary/10 dark:bg-secondary/5",
        className
      )}
    >
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {isLoading && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="p-3 rounded-full bg-secondary/20 text-secondary-foreground">
                  <Loader className="animate-spin size-8" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center flex-col gap-3 min-h-[400px]">
                <div className="p-3 rounded-full bg-destructive/20 text-destructive">
                  <XIcon className="size-8" />
                </div>
                <div className="text-sm text-center text-muted-foreground">
                  {error.message}
                </div>
              </div>
            )}

            {data && data.data.length === 0 && (
              <div className="flex items-center justify-center flex-col gap-3 min-h-[400px]">
                <div className="text-lg font-medium text-muted-foreground">
                  No products found
                </div>
                <div className="text-sm text-center text-muted-foreground">
                  Try adjusting your search or filter criteria
                </div>
              </div>
            )}

            {data && data.data.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {data.data.map((product) => (
                  <ProductItem
                    product={product}
                    page="pos"
                    view="grid"
                    onClick={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Pagination Bar */}
      {data && (
        <div className="flex-shrink-0 border-t border-border/20">
          <Pagination
            entityName="Products"
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalCount={data.meta.totalCount}
            totalPages={data.meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
