import { SelectCashDrawerBalance, SelectShift } from "@/lib/zod/cashflow.zod";

export interface CashflowStoreInterface {
  // Types
  activeBalance: SelectCashDrawerBalance | null;

  activeShift: SelectShift | null;
  fetchingActiveShift: boolean;

  // Actions
  setActiveBalance: (balance: SelectCashDrawerBalance | null) => void;

  setActiveShift: (shift: SelectShift | null) => void;
  getActiveShift: () => Promise<void>;
}
