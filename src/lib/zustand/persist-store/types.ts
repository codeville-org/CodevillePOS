import { StoreSettingsT } from "@/lib/zod/settings.zod";
import { PaymentMethod } from "@/lib/zod/transactions.zod";
import { Language, Theme } from "@/shared/types/global";

export interface PersistStoreState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;

  // Language
  language: Language;
  setLanguage: (language: Language) => void;
  initializeLanguage: () => void;

  // Persisted Store Settings
  // (Store Settings fetched from Database)
  storeSettings: StoreSettingsT;
  setStoreSettings: (settings: StoreSettingsT) => void;

  availablePaymentMethods: PaymentMethod[];
  setAvailablePaymentMethods: (methods: PaymentMethod[]) => void;

  imagesEnabled: boolean;
  setImagesEnabled: (enabled: boolean) => void;
}
