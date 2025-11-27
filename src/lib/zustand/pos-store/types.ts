import { SelectCategory } from "@/lib/zod/categories.zod";
import type { UninitializedTransactionItem } from "@/lib/zod/transactions.zod";
import { BaseTransactionSchema } from "@/lib/zod/transactions.zod";

export type SearchMode = "barcode" | "manual";

export type FilterType = "featured" | "all" | SelectCategory;

export type ListingMode = "grid" | "list";

export type POSListingView = "listing" | "billing";

export type ScannedProduct = {
  id: string;
  name: string;
  barcode: string;
  timestamp: number;
};

export type AmountOverview = {
  subtotal: number;
  tax: number;
  productDiscount: number;
  additionalDiscount: number;
  discount: number;
  total: number;
};

export interface PosStoreInterface {
  // Listing View
  listingView: POSListingView;
  setListingView: (view: POSListingView) => void;

  listingMode: ListingMode;
  setListingMode: (mode: ListingMode) => void;

  searchTerm: string | null;
  setSearchTerm: (term: string) => void;
  resetSearch: () => void;

  // Last scanned product tracking
  lastScannedProduct: ScannedProduct | null;
  setLastScannedProduct: (product: ScannedProduct | null) => void;

  // Products Listing
  filter: FilterType;
  setFilter: (filter: FilterType) => void;

  // Transaction State
  activeTransaction: BaseTransactionSchema | null;
  setActiveTransaction: (transaction: BaseTransactionSchema | null) => void;

  transactionItems: UninitializedTransactionItem[];
  addTransactionItem: (item: UninitializedTransactionItem) => void;

  changeTransactionItemQuantity: (id: string, quantity: number) => void;

  updateTransactionItem: (
    id: string,
    item: UninitializedTransactionItem
  ) => void;

  setDiscountAmount: (discount: number) => void;
  setTaxAmount: (tax: number) => void;

  removeTransactionItem: (id: string) => void;

  clearTransactionItems: () => void;

  getTransactionAmountOverview: () => AmountOverview;
}
