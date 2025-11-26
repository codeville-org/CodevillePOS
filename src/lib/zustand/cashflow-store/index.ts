import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { electronStorage } from "../local-storage";
import { fetchActiveShift } from "./actions";
import type { CashflowStoreInterface } from "./types";

export const useCashflow = create<CashflowStoreInterface>()(
  persist(
    (set, get) => ({
      activeBalance: null as CashflowStoreInterface["activeBalance"],
      setActiveBalance: (balance) => set({ activeBalance: balance }),

      activeShift: null as CashflowStoreInterface["activeShift"],
      fetchingActiveShift:
        false as CashflowStoreInterface["fetchingActiveShift"],

      activeListingShift: null as CashflowStoreInterface["activeListingShift"],

      setActiveShift: (shift) => set({ activeShift: shift }),
      getActiveShift: async () => {
        const { activeShift } = get();

        if (activeShift) return;

        set({ fetchingActiveShift: true });

        try {
          const res = await fetchActiveShift();
          set({ activeShift: res, fetchingActiveShift: false });
        } catch (error) {
          console.error("Failed to fetch active shift:", error);
          set({ activeShift: null, fetchingActiveShift: false });
        }
      },

      setActiveListingShift: (shift) => set({ activeListingShift: shift }),

      // Reset all cashflow state
      resetCashflowState: () =>
        set({
          activeBalance: null,
          activeShift: null,
          fetchingActiveShift: false,
          activeListingShift: null
        })
    }),
    {
      name: "cashflow-store",
      storage: createJSONStorage(() => electronStorage),
      // Add version for migration if needed
      version: 1,
      migrate: (persistedState, version) => {
        // Reset state if version mismatch (useful after DB resets)
        if (version < 1) {
          return {
            activeBalance: null,
            activeShift: null,
            fetchingActiveShift: false,
            activeListingShift: null
          };
        }
        return persistedState;
      }
    }
  )
);
