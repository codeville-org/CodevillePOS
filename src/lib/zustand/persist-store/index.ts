import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Language, Theme } from "@/shared/types/global";

import { PaymentMethod } from "@/lib/zod/transactions.zod";
import { electronStorage } from "../local-storage";
import { applyTheme } from "./actions";
import type { PersistStoreState } from "./types";

export const usePersistStore = create<PersistStoreState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: "system",

      setTheme: (theme: Theme) => {
        set({ theme });
        applyTheme(theme);
      },

      initializeTheme: () => {
        const { theme } = get();
        applyTheme(theme);
      },

      // Language
      language: "en",

      setLanguage: (language: Language) => {
        set({ language });
      },

      initializeLanguage: () => {
        const { language } = get();
        set({ language });
      },

      storeSettings: {
        storeName: "",
        storeLogo: "",
        contactPhone: "",
        address: ""
      },
      setStoreSettings: (settings) => {
        set({ storeSettings: settings });
      },
      availablePaymentMethods: [PaymentMethod.CASH],
      setAvailablePaymentMethods: (methods: PaymentMethod[]) => {
        set({ availablePaymentMethods: methods });
      },
      imagesEnabled: true,
      setImagesEnabled: (enabled: boolean) => {
        set({ imagesEnabled: enabled });
      }
    }),
    {
      name: "persist-store",
      storage: createJSONStorage(() => electronStorage)
    }
  )
);
