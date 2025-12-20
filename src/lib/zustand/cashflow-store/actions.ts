import { useElectronAPI } from "@/hooks/use-electron-api";
import { SelectShift } from "@/lib/zod/cashflow.zod";

export async function fetchActiveShift(): Promise<SelectShift | null> {
  const api = useElectronAPI();

  const response = await api.cashflow.getActiveShift();

  if (response.error || !response?.success) return null;

  return response.data;
}
