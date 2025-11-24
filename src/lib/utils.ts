import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UninitializedTransactionItem } from "./zod/transactions.zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatPrice(price: number, lang?: string) {
  if (lang === "si") {
    return `රු. ${new Intl.NumberFormat("si-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "LKR"
  }).format(price);
}

/**
 * Generates a unique 12-digit number suitable for database constraints
 * Format: TTTTTTTRRRR (7 digits timestamp + 4 digits random + 1 check digit)
 * @returns A 12-digit unique number as a string
 */
export function generateUniqueId(): string {
  // Get current timestamp and use last 7 digits for time component
  const timestamp = Date.now();
  const timeComponent = (timestamp % 10000000).toString().padStart(7, "0");

  // Generate 4-digit random component
  const randomComponent = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  // Generate check digit using simple modulo 10
  const baseNumber = timeComponent + randomComponent;
  const checkDigit = (parseInt(baseNumber) % 10).toString();

  return baseNumber + checkDigit;
}

/**
 * Get Product Amount based on Unit Price and Number of Units
 * @param item - The transaction item containing product details
 * @param quantity - The number of units for the product
 */
export function getProductAmount(
  item: UninitializedTransactionItem,
  quantity: number
) {
  /**
   * Explanation: Micro unit price
   * Assume unitAmount is 250 (g) and unit price is 100,
   * Then it means it cost 100 amount per 250g
   * Therefore, for 1g it will cost 100/250 = 0.4
   *
   * It used to calculate total amount based on unit amount and unit price
   */
  const microUnitPrice = item.unitPrice / item.unitAmount;

  console.log(`Total: LKR ${microUnitPrice * quantity}`);

  return microUnitPrice * quantity;
}

export function playBeep(frequency: number, duration: number) {
  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.error("Failed to play beep:", error);
  }
}

/**
 * Cash Drawer Events List
 */
export const cashdrawerEventsList = [
  "opening_balance", // Morning cash count
  "cash_in", // Cash received from customer
  "cash_out", // Change given to customer
  "manual_add", // Admin manually adds cash
  "manual_remove", // Admin manually removes cash
  "shift_end", // End of shift reconciliation
  "correction" // Balance correction
];
