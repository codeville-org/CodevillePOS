import { getDB } from "@/database";
import {
  categories,
  customers,
  products,
  settings,
  transactionItems,
  transactions
} from "@/database/schema";
import type {
  AppSettingsMapInsertT,
  AppSettingsMapT,
  GetAppSettingsResponseT,
  ResetSystemResponseT
} from "@/lib/zod/settings.zod";
import { PaymentMethod } from "@/lib/zod/transactions.zod";
import { eq } from "drizzle-orm";
import { app } from "electron";
import * as fs from "node:fs/promises";
import path from "path";

function prepareSettingsMap(allValues: any[]): AppSettingsMapT {
  let settingsMap: AppSettingsMapT = {
    defaultPrinter: "",
    storeLogo: "",
    storeName: "",
    address: "",
    contactPhone: "",
    availablePaymentMethods: []
  };

  for (const setting of allValues) {
    switch (setting.key) {
      case "defaultPrinter":
        settingsMap.defaultPrinter = (setting?.value as string) || "";
        break;
      case "storeLogo":
        settingsMap.storeLogo = (setting?.value as string) || "";
        break;
      case "storeName":
        settingsMap.storeName = (setting?.value as string) || "";
        break;
      case "address":
        settingsMap.address = (setting?.value as string) || "";
        break;
      case "contactPhone":
        settingsMap.contactPhone = (setting?.value as string) || "";
        break;
      case "availablePaymentMethods":
        try {
          // Parse JSON string back to array
          const availableMethods = setting?.value
            ? JSON.parse(setting.value as string)
            : [];

          if (!Array.isArray(availableMethods) || availableMethods.length < 1) {
            settingsMap.availablePaymentMethods = [PaymentMethod.CASH];
          } else {
            // Filter and deduplicate payment methods
            const validMethods = Array.from(new Set(availableMethods)).filter(
              (method) =>
                Object.values(PaymentMethod).includes(method as PaymentMethod)
            );

            settingsMap.availablePaymentMethods =
              validMethods.length > 0
                ? (validMethods as PaymentMethod[])
                : [PaymentMethod.CASH];
          }
        } catch (error) {
          console.error("Failed to parse availablePaymentMethods:", error);
          settingsMap.availablePaymentMethods = [PaymentMethod.CASH];
        }
        break;
    }
  }

  return settingsMap;
}

// ================= Get App Settings Controller =================
export async function getAppSettingsController(): Promise<GetAppSettingsResponseT> {
  try {
    const db = getDB();

    const allValues = await db.query.settings.findMany();

    const settingsMap = prepareSettingsMap(allValues);

    return {
      data: settingsMap,
      success: true,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
      success: false
    };
  }
}

// ================= Upsert App Settings Controller =================
export async function upsertAppSettingsController(
  payload: AppSettingsMapInsertT
): Promise<GetAppSettingsResponseT> {
  try {
    const db = getDB();

    await Promise.all(
      Object.keys(payload).map(async (key: string) => {
        const keyValue: any = (payload as Record<string, any>)[key];

        if (keyValue !== undefined && keyValue !== null) {
          // Serialize arrays to JSON strings for storage
          const valueToStore = Array.isArray(keyValue)
            ? JSON.stringify(keyValue)
            : (keyValue as string);

          // Debug logging for payment methods
          // if (key === "availablePaymentMethods") {
          //   console.log(`[UPSERT] Storing ${key}:`, {
          //     original: keyValue,
          //     serialized: valueToStore
          //   });
          // }

          // Check if the setting already exists
          const existingSetting = await db.query.settings.findFirst({
            where: eq(settings.key, key)
          });

          if (existingSetting) {
            await db
              .update(settings)
              .set({ value: valueToStore, updatedAt: new Date() })
              .where(eq(settings.id, existingSetting.id));
          } else {
            // Insert a new setting
            await db.insert(settings).values({ key, value: valueToStore });
          }
        }
      })
    );

    const allValues = await db.query.settings.findMany();

    const settingsMap = prepareSettingsMap(allValues);

    return {
      data: settingsMap,
      success: true,
      error: null
    };
  } catch (error) {
    console.log(error);
    return {
      data: null,
      error: (error as Error).message,
      success: false
    };
  }
}

// Helper function to get images directory path
function getImagesDirectory(): string {
  let baseDir: string;

  if (!app.isReady()) {
    return path.join(process.cwd(), "images");
  }

  if (app.isPackaged) {
    baseDir = app.getPath("documents");
    return path.join(baseDir, "CodeVille POS", "images");
  } else {
    baseDir = process.cwd();
    return path.join(baseDir, "images");
  }
}

// Helper function to get bills directory path
function getBillsDirectory(): string {
  let baseDir: string;

  if (!app.isReady()) {
    return path.join(process.cwd(), "bills");
  }

  if (app.isPackaged) {
    baseDir = app.getPath("documents");
    return path.join(baseDir, "CodeVille POS", "bills");
  } else {
    baseDir = process.cwd();
    return path.join(baseDir, "bills");
  }
}

// Helper function to clear directory contents
async function clearDirectoryContents(dirPath: string): Promise<void> {
  try {
    // Check if directory exists
    const dirExists = await fs
      .access(dirPath)
      .then(() => true)
      .catch(() => false);

    if (!dirExists) {
      // Directory doesn't exist, nothing to clear
      return;
    }

    // Read all files and subdirectories
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    // Delete each entry
    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively delete directory
          await fs.rm(fullPath, { recursive: true, force: true });
        } else {
          // Delete file
          await fs.unlink(fullPath);
        }
      })
    );
  } catch (error) {
    console.error(`Failed to clear directory ${dirPath}:`, error);
    throw error;
  }
}

// ================= System Reset Controller =================
export async function resetSystemController(): Promise<ResetSystemResponseT> {
  try {
    const db = getDB();

    // Clear all database tables
    // Note: We need to clear in the correct order due to foreign key constraints
    // 1. Transaction items (has FK to transactions and products)
    // 2. Transactions (has FK to customers)
    // 3. Products (has FK to categories)
    // 4. Customers
    // 5. Categories
    // 6. Settings (clear all except password-related settings if needed)

    await db.delete(transactionItems);
    await db.delete(transactions);
    await db.delete(products);
    await db.delete(customers);
    await db.delete(categories);

    // Clear settings except password (optional - uncomment if you want to keep password)
    // await db.delete(settings).where(sql`${settings.key} != 'password'`);

    // Or clear all settings
    await db.delete(settings);

    // Clear images folder
    const imagesDir = getImagesDirectory();
    await clearDirectoryContents(imagesDir);

    // Clear bills folder
    const billsDir = getBillsDirectory();
    await clearDirectoryContents(billsDir);

    return {
      data: {
        message: "System reset successfully. All data has been cleared."
      },
      success: true,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message || "Failed to reset system",
      success: false
    };
  }
}
