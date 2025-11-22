import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";
import { electronStorage } from "../local-storage";
import type { CashflowStoreInterface } from "./types";

export const useCashflow = create<CashflowStoreInterface>()(
  persist(
    (set, get) => ({
      activeBalance: null as CashflowStoreInterface["activeBalance"],
      setActiveBalance: (balance) => set({ activeBalance: balance })
    }),
    {
      name: "cashflow-store",
      storage: createJSONStorage(() => electronStorage)
    }
  )
);
