import { create } from "zustand";

import { getProductAmount } from "@/lib/utils";
import type { UninitializedTransactionItem } from "@/lib/zod/transactions.zod";
import type { PosStoreInterface } from "./types";

function sortTransactionItems(
  items: UninitializedTransactionItem[]
): UninitializedTransactionItem[] {
  // Sort items by product name
  return items.sort((a, b) => a.productName.localeCompare(b.productName));
}

export const usePosStore = create<PosStoreInterface>()((set, get) => ({
  searchMode: "barcode",
  setSearchMode: (mode) => set({ searchMode: mode }),

  listingView: "listing",
  setListingView: (view) => set({ listingView: view }),

  searchTerm: null,
  setSearchTerm: (term) => set({ searchTerm: term }),
  resetSearch: () => set({ searchTerm: null }),

  // Last scanned product tracking
  lastScannedProduct: null,
  setLastScannedProduct: (product) => set({ lastScannedProduct: product }),

  filter: "featured",
  setFilter: (filter) => set({ filter }),

  // Transaction Related
  activeTransaction: null,
  setActiveTransaction: (transaction) =>
    set({ activeTransaction: transaction }),

  transactionItems: [],

  /**
   * Add new Product to Active Transaction
   * @param item - Item to add active transaction
   */
  addTransactionItem: (item) => {
    const { transactionItems } = get();

    const exsistingArray = transactionItems.filter(
      (arrayItem) => arrayItem.productId === item.productId
    );

    if (exsistingArray.length > 0) {
      const existingItem = exsistingArray[0];

      const newQuantity = existingItem.quantity + 1;

      const updatedItem: UninitializedTransactionItem = {
        ...existingItem,
        quantity: newQuantity,
        totalAmount: getProductAmount(existingItem, newQuantity)
      };

      const preparedArray = transactionItems.filter(
        (arrayItem) => arrayItem.productId !== existingItem.productId
      );

      preparedArray.push(updatedItem);

      set({ transactionItems: sortTransactionItems(preparedArray) });
    } else {
      set({
        transactionItems: sortTransactionItems([...transactionItems, item])
      });
    }
  },

  /**
   * Handle change quantity
   * @param id - ID of item to update
   * @param quantity - New quantity
   */
  changeTransactionItemQuantity: (id: string, quantity: number) => {
    const { transactionItems } = get();

    if (quantity <= 0) {
      return;
    }

    const existingItemArr = transactionItems.filter(
      (arrayItem) => arrayItem.productId === id
    );

    if (existingItemArr.length > 0) {
      const existingItem = existingItemArr[0];

      const updatedItem: UninitializedTransactionItem = {
        ...existingItem,
        quantity,
        totalAmount: getProductAmount(existingItem, quantity)
      };

      const preparedArray = transactionItems.filter(
        (arrayItem) => arrayItem.productId !== existingItem.productId
      );

      preparedArray.push(updatedItem);

      set({ transactionItems: sortTransactionItems(preparedArray) });
    }
  },

  /**
   * Update active transaction item by id
   * @param id - ID of item to update
   * @param item - Update body
   */
  updateTransactionItem: (id, item) => {
    const { transactionItems } = get();
    const existingItemArr = transactionItems.filter(
      (arrayItem) => arrayItem.productId === id
    );

    if (existingItemArr.length > 0) {
      const existingItem = existingItemArr[0];

      const updatedItem: UninitializedTransactionItem = {
        ...existingItem,
        ...item
      };

      const preparedArray = transactionItems.filter(
        (arrayItem) => arrayItem.productId !== existingItem.productId
      );
      preparedArray.push(updatedItem);

      set({ transactionItems: sortTransactionItems(preparedArray) });
    }
  },

  /**
   * @param id - Product ID to delete from active transaction
   */
  removeTransactionItem: (id) => {
    const { transactionItems } = get();

    const preparedArray = transactionItems.filter(
      (arrayItem) => arrayItem.productId !== id
    );

    set({ transactionItems: sortTransactionItems(preparedArray) });
  },

  /**
   * This clears all items from active transaction
   */
  clearTransactionItems: () => set({ transactionItems: [] }),

  getTransactionAmountOverview: () => {
    const { transactionItems, activeTransaction } = get();

    const subtotal = transactionItems.reduce(
      (acc, item) => acc + item.totalAmount,
      0
    );

    const tax = activeTransaction?.taxAmount || 0;
    const discount = activeTransaction?.discountAmount || 0;
    const total = subtotal + tax - discount;

    return {
      subtotal,
      tax,
      discount,
      total
    };
  },

  setDiscountAmount: (discount: number) => {
    const { activeTransaction, setActiveTransaction } = get();

    if (!activeTransaction) return;

    setActiveTransaction({
      ...activeTransaction,
      discountAmount: discount
    });
  },

  setTaxAmount: (tax: number) => {
    const { activeTransaction, setActiveTransaction } = get();

    if (!activeTransaction) return;

    setActiveTransaction({
      ...activeTransaction,
      taxAmount: tax
    });
  }
}));
