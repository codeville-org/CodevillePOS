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

        const res = await fetchActiveShift();

        set({ activeShift: res, fetchingActiveShift: false });
      },

      setActiveListingShift: (shift) => set({ activeListingShift: shift })
    }),
    {
      name: "cashflow-store",
      storage: createJSONStorage(() => electronStorage)
    }
  )
);
