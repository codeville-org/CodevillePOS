import { SelectCashDrawerBalance } from "@/lib/zod/cashflow.zod";

export interface CashflowStoreInterface {
  // Types
  activeBalance: SelectCashDrawerBalance | null;

  // Actions
  setActiveBalance: (balance: SelectCashDrawerBalance | null) => void;
}
