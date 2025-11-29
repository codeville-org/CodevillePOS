import {
  BaseTransactionSchema,
  UninitializedTransactionItem
} from "@/lib/zod/transactions.zod";
import { usePosStore } from "./index";
import { HoldQueueItem } from "./types";

interface AddToHoldQueueParams {
  transaction: BaseTransactionSchema;
  items: UninitializedTransactionItem[];
}

// Add current transaction to hold queue
export function addTransactionToHoldQueue(
  params: AddToHoldQueueParams
): boolean {
  try {
    const { items, transaction } = params;
    const { holdQueue, setHoldQueue } = usePosStore.getState();

    const updatedQueue: HoldQueueItem[] = [
      ...holdQueue,
      {
        ...transaction,
        items
      }
    ];

    setHoldQueue(updatedQueue);
    return true;
  } catch (error) {
    return false;
  }
}

// Remove transaction from hold queue by ID
export function removeTransactionFromHoldQueue(id: string): boolean {
  try {
    const { holdQueue, setHoldQueue } = usePosStore.getState();

    const updatedQueue = holdQueue.filter((item) => item.id !== id);

    setHoldQueue(updatedQueue);
    return true;
  } catch (error) {
    return false;
  }
}

// Clear all transactions from hold queue
export function clearHoldQueue(): boolean {
  try {
    const { setHoldQueue } = usePosStore.getState();
    setHoldQueue([]);
    return true;
  } catch (error) {
    return false;
  }
}
