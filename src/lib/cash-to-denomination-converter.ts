import { Denominations, SelectCashDrawerBalance } from "./zod/cashflow.zod";

export function cashToDenominationConverter(
  cashAmount: number,
  activeBalance: SelectCashDrawerBalance | null
): Denominations {
  const currentCashDrawerBalance = activeBalance;

  // Initialize result with all denominations as 0
  const result: Denominations = {
    notes_5000: 0,
    notes_2000: 0,
    notes_1000: 0,
    notes_500: 0,
    notes_100: 0,
    notes_50: 0,
    notes_20: 0,
    coins_10: 0,
    coins_5: 0,
    coins_2: 0,
    coins_1: 0
  };

  // If no active balance or insufficient funds, return empty denominations
  if (
    !currentCashDrawerBalance ||
    currentCashDrawerBalance.totalAmount < cashAmount
  ) {
    return result;
  }

  // Define denominations in descending order with their values and available counts
  const denominations = [
    {
      value: 5000,
      key: "notes_5000" as keyof Denominations,
      available: currentCashDrawerBalance.notes_5000
    },
    {
      value: 2000,
      key: "notes_2000" as keyof Denominations,
      available: currentCashDrawerBalance.notes_2000
    },
    {
      value: 1000,
      key: "notes_1000" as keyof Denominations,
      available: currentCashDrawerBalance.notes_1000
    },
    {
      value: 500,
      key: "notes_500" as keyof Denominations,
      available: currentCashDrawerBalance.notes_500
    },
    {
      value: 100,
      key: "notes_100" as keyof Denominations,
      available: currentCashDrawerBalance.notes_100
    },
    {
      value: 50,
      key: "notes_50" as keyof Denominations,
      available: currentCashDrawerBalance.notes_50
    },
    {
      value: 20,
      key: "notes_20" as keyof Denominations,
      available: currentCashDrawerBalance.notes_20
    },
    {
      value: 10,
      key: "coins_10" as keyof Denominations,
      available: currentCashDrawerBalance.coins_10
    },
    {
      value: 5,
      key: "coins_5" as keyof Denominations,
      available: currentCashDrawerBalance.coins_5
    },
    {
      value: 2,
      key: "coins_2" as keyof Denominations,
      available: currentCashDrawerBalance.coins_2
    },
    {
      value: 1,
      key: "coins_1" as keyof Denominations,
      available: currentCashDrawerBalance.coins_1
    }
  ];

  let remainingAmount = cashAmount;

  // Greedy algorithm: use largest denominations first
  for (const denomination of denominations) {
    if (remainingAmount <= 0) break;

    // Calculate how many of this denomination we can use
    const maxUsable = Math.floor(remainingAmount / denomination.value);
    const actualUsable = Math.min(maxUsable, denomination.available);

    if (actualUsable > 0) {
      result[denomination.key] = actualUsable;
      remainingAmount -= actualUsable * denomination.value;
    }
  }

  // If we couldn't make exact change, try to find alternative combinations
  if (remainingAmount > 0) {
    // Reset result and try a more flexible approach
    Object.keys(result).forEach((key) => {
      result[key as keyof Denominations] = 0;
    });

    // Try to find a combination that works, even if not optimal
    remainingAmount = cashAmount;

    for (const denomination of denominations) {
      if (remainingAmount <= 0) break;

      const maxUsable = Math.floor(remainingAmount / denomination.value);
      const actualUsable = Math.min(maxUsable, denomination.available);

      if (actualUsable > 0) {
        result[denomination.key] = actualUsable;
        remainingAmount -= actualUsable * denomination.value;
      }
    }

    // If still can't make exact change, return empty result
    if (remainingAmount > 0) {
      Object.keys(result).forEach((key) => {
        result[key as keyof Denominations] = 0;
      });
    }
  }

  return result;
}
