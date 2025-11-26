import { getDB } from "@/database";
import { products, purchaseItems, purchases, vendors } from "@/database/schema";
import { MessageResponseT } from "@/lib/zod/helpers";
import {
  AddPurchaseItemResponseSchema,
  AddPurchaseItemSchema,
  CreatePurchaseResponseSchema,
  CreatePurchaseSchema,
  GetAllPurchasesQuerySchema,
  GetAllPurchasesResponseSchema,
  GetPurchaseByIdResponseSchema,
  PurchaseListItemSchema,
  UpdatePurchaseItemResponseSchema,
  UpdatePurchaseItemSchema,
  UpdatePurchaseResponseSchema,
  UpdatePurchaseSchema
} from "@/lib/zod/supplier.zod";
import { and, desc, eq, sql } from "drizzle-orm";

// Get all purchases controller
export async function getAllPurchasesController(
  query: GetAllPurchasesQuerySchema
): Promise<GetAllPurchasesResponseSchema> {
  try {
    const db = getDB();

    const { search, page, limit, sort, vendorId } = query;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // Cap at 100 items
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const whereConditions = [];
    if (search) {
      whereConditions.push(
        sql`LOWER(${purchases.totalAmount}) LIKE LOWER(${`%${search}%`})`
      );
    }
    if (vendorId) {
      whereConditions.push(sql`${purchases.vendorId} = ${vendorId}`);
    }

    // Build the query
    const purchaseEntries = await db.query.purchases.findMany({
      where: whereConditions.length ? and(...whereConditions) : undefined,
      with: {
        vendor: {
          columns: {
            id: true,
            name: true
          }
        },
        purchaseItems: {
          columns: {
            id: true
          }
        }
      },
      orderBy: [
        sort.toLowerCase() === "asc"
          ? purchases.createdAt
          : desc(purchases.createdAt)
      ],
      limit: limitNum,
      offset: offset
    });

    // Get total count for pagination metadata
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(purchases)
      .leftJoin(vendors, eq(purchases.vendorId, vendors.id))
      .where(whereConditions.length ? and(...whereConditions) : undefined);

    const _totalCount = await totalCountQuery;
    const totalCount = _totalCount[0]?.count || 0;

    // Transform the data
    const preparedEntries: PurchaseListItemSchema[] = purchaseEntries.map(
      (purchase) => ({
        ...purchase,
        vendor: purchase.vendor
          ? {
              id: purchase.vendor.id,
              name: purchase.vendor.name
            }
          : undefined,
        totalItems: purchase.purchaseItems.length
      })
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);

    return {
      data: {
        data: preparedEntries,
        meta: {
          currentPage: pageNum,
          limit: limitNum,
          totalCount,
          totalPages
        }
      },
      success: true,
      error: null
    };
  } catch (error) {
    return {
      error: (error as Error).message || "Failed to fetch purchases",
      success: false
    };
  }
}

// Create new purchase controller with transaction support
export async function createPurchaseController(
  input: CreatePurchaseSchema
): Promise<CreatePurchaseResponseSchema> {
  const db = getDB();

  try {
    // Use transaction for data consistency
    const result = await db.transaction(async (tx) => {
      // Amount data aren't providing when creation
      const totalAmount = 0;
      const paidAmount = 0;
      const dueAmount = 0;

      // Validate that vendor exists
      const vendorExists = await tx.query.vendors.findFirst({
        where: eq(vendors.id, input.vendorId),
        columns: { id: true, name: true }
      });

      if (!vendorExists) {
        throw new Error("Vendor not found");
      }

      // Create the purchase
      const [newPurchase] = await tx
        .insert(purchases)
        .values({
          vendorId: input.vendorId,
          purchaseDescription: input.purchaseDescription,
          totalAmount,
          paidAmount,
          dueAmount,
          status: input.status ?? "active"
        })
        .returning();

      return newPurchase;
    });

    return {
      data: result,
      success: true
    };
  } catch (error) {
    console.error("Create purchase error:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("FOREIGN KEY constraint failed")) {
        return {
          error: "Invalid vendor ID provided",
          success: false
        };
      }

      if (error.message.includes("UNIQUE constraint failed")) {
        return {
          error: "Purchase with this data already exists",
          success: false
        };
      }

      if (error.message === "Vendor not found") {
        return {
          error: "The specified vendor does not exist",
          success: false
        };
      }

      // Handle validation errors
      if (error.message.includes("amount")) {
        return {
          error: error.message,
          success: false
        };
      }
    }

    return {
      error: (error as Error).message || "Failed to create purchase",
      success: false
    };
  }
}

// Get purchase by ID controller
export async function getPurchaseByIdController(
  id: string
): Promise<GetPurchaseByIdResponseSchema> {
  try {
    const db = getDB();

    // Validate input
    if (!id || typeof id !== "string") {
      return {
        error: "Invalid purchase ID provided",
        success: false
      };
    }

    // Get purchase with all related data
    const purchase = await db.query.purchases.findFirst({
      where: eq(purchases.id, id),
      with: {
        vendor: {
          columns: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true
          }
        },
        purchaseItems: {
          columns: {
            id: true,
            purchaseId: true,
            productId: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            createdAt: true,
            updatedAt: true
          },
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                barcode: true,
                unitPrice: true,
                unit: true
              }
            }
          }
        },
        cashDrawerEvents: true
      }
    });

    if (!purchase) {
      return {
        error: "Purchase not found",
        success: false
      };
    }

    return {
      data: purchase,
      success: true
    };
  } catch (error) {
    console.error("Get purchase by ID error:", error);

    return {
      error: (error as Error).message || "Failed to fetch purchase",
      success: false
    };
  }
}

// Update purchase controller with validation and transaction support
export async function updatePurchaseController(
  id: string,
  input: UpdatePurchaseSchema
): Promise<UpdatePurchaseResponseSchema> {
  const db = getDB();

  try {
    // Validate input
    if (!id || typeof id !== "string") {
      return {
        error: "Invalid purchase ID provided",
        success: false
      };
    }

    // Use transaction for data consistency
    const result = await db.transaction(async (tx) => {
      // Check if purchase exists
      const existingPurchase = await tx.query.purchases.findFirst({
        where: eq(purchases.id, id),
        columns: {
          id: true,
          vendorId: true,
          totalAmount: true,
          paidAmount: true
        }
      });

      if (!existingPurchase) {
        throw new Error("Purchase not found");
      }

      // If vendorId is being updated, validate that new vendor exists
      if (input.vendorId && input.vendorId !== existingPurchase.vendorId) {
        const vendorExists = await tx.query.vendors.findFirst({
          where: eq(vendors.id, input.vendorId),
          columns: { id: true }
        });

        if (!vendorExists) {
          throw new Error("Vendor not found");
        }
      }

      // Calculate amounts if provided
      const totalAmount = input.totalAmount ?? existingPurchase.totalAmount;
      const paidAmount = input.paidAmount ?? existingPurchase.paidAmount;

      // Auto-calculate dueAmount if totalAmount or paidAmount changed
      let dueAmount = input.dueAmount;
      if (input.totalAmount !== undefined || input.paidAmount !== undefined) {
        dueAmount = Math.max(0, totalAmount - paidAmount);
      }

      // Validate amounts
      if (paidAmount < 0) {
        throw new Error("Paid amount cannot be negative");
      }

      if (totalAmount < 0) {
        throw new Error("Total amount cannot be negative");
      }

      if (paidAmount > totalAmount) {
        throw new Error("Paid amount cannot exceed total amount");
      }

      // Prepare update data
      const updateData = {
        ...input,
        ...(dueAmount !== undefined && { dueAmount })
      };

      // Remove undefined values
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      // If no data to update
      if (Object.keys(cleanUpdateData).length === 0) {
        return existingPurchase;
      }

      // Update the purchase
      const [updatedPurchase] = await tx
        .update(purchases)
        .set(cleanUpdateData)
        .where(eq(purchases.id, id))
        .returning();

      return updatedPurchase;
    });

    return {
      data: result,
      success: true
    };
  } catch (error) {
    console.error("Update purchase error:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("FOREIGN KEY constraint failed")) {
        return {
          error: "Invalid vendor ID provided",
          success: false
        };
      }

      if (error.message === "Purchase not found") {
        return {
          error: "The specified purchase does not exist",
          success: false
        };
      }

      if (error.message === "Vendor not found") {
        return {
          error: "The specified vendor does not exist",
          success: false
        };
      }

      // Handle validation errors
      if (error.message.includes("amount")) {
        return {
          error: error.message,
          success: false
        };
      }
    }

    return {
      error: (error as Error).message || "Failed to update purchase",
      success: false
    };
  }
}

// Delete purchase controller
export async function deletePurchaseController(
  id: string
): Promise<MessageResponseT> {
  try {
    const db = getDB();

    // Validate input
    if (!id || typeof id !== "string") {
      return {
        error: "Invalid purchase ID provided",
        success: false
      };
    }

    // Use transaction for data consistency
    await db.transaction(async (tx) => {
      // Check if purchase exists
      const existingPurchase = await tx.query.purchases.findFirst({
        where: eq(purchases.id, id),
        columns: { id: true, status: true },
        with: {
          purchaseItems: {
            columns: { id: true }
          },
          cashDrawerEvents: {
            columns: { id: true }
          }
        }
      });

      if (!existingPurchase) {
        throw new Error("Purchase not found");
      }

      // Check if purchase can be deleted (business rule)
      if (existingPurchase.status === "completed") {
        throw new Error("Cannot delete completed purchase");
      }

      // Check if there are associated cash drawer events
      if (
        existingPurchase.cashDrawerEvents &&
        existingPurchase.cashDrawerEvents.length > 0
      ) {
        throw new Error(
          "Cannot delete purchase with associated cash drawer transactions"
        );
      }

      // Delete the purchase (cascade will handle purchase items)
      const deleteResult = await tx
        .delete(purchases)
        .where(eq(purchases.id, id));

      return deleteResult;
    });

    return {
      data: { message: "Purchase deleted successfully" },
      success: true
    };
  } catch (error) {
    console.error("Delete purchase error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "Purchase not found") {
        return {
          error: "The specified purchase does not exist",
          success: false
        };
      }

      if (error.message === "Cannot delete completed purchase") {
        return {
          error: "Completed purchases cannot be deleted",
          success: false
        };
      }

      if (error.message.includes("cash drawer transactions")) {
        return {
          error:
            "Cannot delete purchase with associated cash drawer transactions",
          success: false
        };
      }

      if (error.message.includes("FOREIGN KEY constraint failed")) {
        return {
          error: "Cannot delete purchase due to associated records",
          success: false
        };
      }
    }

    return {
      error: (error as Error).message || "Failed to delete purchase",
      success: false
    };
  }
}

// Add purchase item controller
export async function addPurchaseItemController(
  input: AddPurchaseItemSchema
): Promise<AddPurchaseItemResponseSchema> {
  const db = getDB();

  try {
    // Use transaction for data consistency
    const result = await db.transaction(async (tx) => {
      // Validate that purchase exists and is active
      const existingPurchase = await tx.query.purchases.findFirst({
        where: eq(purchases.id, input.purchaseId),
        columns: {
          id: true,
          status: true,
          totalAmount: true,
          paidAmount: true,
          dueAmount: true
        }
      });

      if (!existingPurchase) {
        throw new Error("Purchase not found");
      }

      if (existingPurchase.status === "completed") {
        throw new Error("Cannot add items to completed purchase");
      }

      // Validate product exists if productId is provided
      if (input.productId) {
        const productExists = await tx.query.products.findFirst({
          where: eq(products.id, input.productId),
          columns: { id: true, name: true, unitPrice: true }
        });

        if (!productExists) {
          throw new Error("Product not found");
        }
      }

      // Validate input values
      if (input.quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
      }

      if (input.unitPrice <= 0) {
        throw new Error("Unit price must be greater than zero");
      }

      // Calculate total price if not provided
      const totalPrice = input.totalPrice ?? input.quantity * input.unitPrice;

      // Validate calculated total price
      if (totalPrice !== input.quantity * input.unitPrice) {
        throw new Error("Total price does not match quantity × unit price");
      }

      // Create the purchase item
      const [newPurchaseItem] = await tx
        .insert(purchaseItems)
        .values({
          purchaseId: input.purchaseId,
          productId: input.productId,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          totalPrice: totalPrice
        })
        .returning();

      // Update purchase totals
      const newTotalAmount = existingPurchase.totalAmount + totalPrice;
      const newDueAmount = Math.max(
        0,
        newTotalAmount - existingPurchase.paidAmount
      );

      await tx
        .update(purchases)
        .set({
          totalAmount: newTotalAmount,
          dueAmount: newDueAmount
        })
        .where(eq(purchases.id, input.purchaseId));

      return newPurchaseItem;
    });

    return {
      data: result,
      success: true
    };
  } catch (error) {
    console.error("Add purchase item error:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("FOREIGN KEY constraint failed")) {
        return {
          error: "Invalid purchase or product ID provided",
          success: false
        };
      }

      if (error.message === "Purchase not found") {
        return {
          error: "The specified purchase does not exist",
          success: false
        };
      }

      if (error.message === "Product not found") {
        return {
          error: "The specified product does not exist",
          success: false
        };
      }

      if (error.message === "Cannot add items to completed purchase") {
        return {
          error: "Cannot add items to a completed purchase",
          success: false
        };
      }

      // Handle validation errors
      if (
        error.message.includes("Quantity") ||
        error.message.includes("price")
      ) {
        return {
          error: error.message,
          success: false
        };
      }
    }

    return {
      error: (error as Error).message || "Failed to add purchase item",
      success: false
    };
  }
}

// Update purchase item controller
export async function updatePurchaseItemController(
  id: string,
  input: UpdatePurchaseItemSchema
): Promise<UpdatePurchaseItemResponseSchema> {
  const db = getDB();

  try {
    // Validate input
    if (!id || typeof id !== "string") {
      return {
        error: "Invalid purchase item ID provided",
        success: false
      };
    }

    // Use transaction for data consistency
    const result = await db.transaction(async (tx) => {
      // Check if purchase item exists
      const existingItem = await tx.query.purchaseItems.findFirst({
        where: eq(purchaseItems.id, id),
        columns: {
          id: true,
          purchaseId: true,
          productId: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true
        },
        with: {
          purchase: {
            columns: {
              id: true,
              status: true,
              totalAmount: true,
              paidAmount: true
            }
          }
        }
      });

      if (!existingItem) {
        throw new Error("Purchase item not found");
      }

      if (existingItem.purchase?.status === "completed") {
        throw new Error("Cannot update items in completed purchase");
      }

      // If productId is being updated, validate that new product exists
      if (input.productId && input.productId !== existingItem.productId) {
        const productExists = await tx.query.products.findFirst({
          where: eq(products.id, input.productId),
          columns: { id: true }
        });

        if (!productExists) {
          throw new Error("Product not found");
        }
      }

      // Calculate new values
      const newQuantity = input.quantity ?? existingItem.quantity;
      const newUnitPrice = input.unitPrice ?? existingItem.unitPrice;

      // Validate input values
      if (newQuantity <= 0) {
        throw new Error("Quantity must be greater than zero");
      }

      if (newUnitPrice <= 0) {
        throw new Error("Unit price must be greater than zero");
      }

      // Calculate new total price
      const newTotalPrice = input.totalPrice ?? newQuantity * newUnitPrice;

      // Validate calculated total price
      if (newTotalPrice !== newQuantity * newUnitPrice) {
        throw new Error("Total price does not match quantity × unit price");
      }

      // Prepare update data
      const updateData = {
        ...input,
        totalPrice: newTotalPrice
      };

      // Remove undefined values
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      // If no data to update
      if (Object.keys(cleanUpdateData).length === 0) {
        return existingItem;
      }

      // Update the purchase item
      const [updatedItem] = await tx
        .update(purchaseItems)
        .set(cleanUpdateData)
        .where(eq(purchaseItems.id, id))
        .returning();

      // Update purchase totals if amounts changed
      if (
        input.quantity !== undefined ||
        input.unitPrice !== undefined ||
        input.totalPrice !== undefined
      ) {
        const priceDifference = newTotalPrice - existingItem.totalPrice;
        const newPurchaseTotalAmount =
          (existingItem.purchase?.totalAmount ?? 0) + priceDifference;
        const newDueAmount = Math.max(
          0,
          newPurchaseTotalAmount - (existingItem.purchase?.paidAmount ?? 0)
        );

        await tx
          .update(purchases)
          .set({
            totalAmount: newPurchaseTotalAmount,
            dueAmount: newDueAmount
          })
          .where(eq(purchases.id, existingItem.purchaseId));
      }

      return updatedItem;
    });

    return {
      data: result,
      success: true
    };
  } catch (error) {
    console.error("Update purchase item error:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("FOREIGN KEY constraint failed")) {
        return {
          error: "Invalid product ID provided",
          success: false
        };
      }

      if (error.message === "Purchase item not found") {
        return {
          error: "The specified purchase item does not exist",
          success: false
        };
      }

      if (error.message === "Product not found") {
        return {
          error: "The specified product does not exist",
          success: false
        };
      }

      if (error.message === "Cannot update items in completed purchase") {
        return {
          error: "Cannot update items in a completed purchase",
          success: false
        };
      }

      // Handle validation errors
      if (
        error.message.includes("Quantity") ||
        error.message.includes("price")
      ) {
        return {
          error: error.message,
          success: false
        };
      }
    }

    return {
      error: (error as Error).message || "Failed to update purchase item",
      success: false
    };
  }
}

// Delete purchase item controller
export async function deletePurchaseItemController(
  id: string
): Promise<MessageResponseT> {
  try {
    const db = getDB();

    // Validate input
    if (!id || typeof id !== "string") {
      return {
        error: "Invalid purchase item ID provided",
        success: false
      };
    }

    // Use transaction for data consistency
    await db.transaction(async (tx) => {
      // Check if purchase item exists
      const existingItem = await tx.query.purchaseItems.findFirst({
        where: eq(purchaseItems.id, id),
        columns: {
          id: true,
          purchaseId: true,
          totalPrice: true
        },
        with: {
          purchase: {
            columns: {
              id: true,
              status: true,
              totalAmount: true,
              paidAmount: true
            }
          }
        }
      });

      if (!existingItem) {
        throw new Error("Purchase item not found");
      }

      if (existingItem.purchase?.status === "completed") {
        throw new Error("Cannot delete items from completed purchase");
      }

      // Delete the purchase item
      await tx.delete(purchaseItems).where(eq(purchaseItems.id, id));

      // Update purchase totals
      const newPurchaseTotalAmount =
        (existingItem.purchase?.totalAmount ?? 0) - existingItem.totalPrice;
      const newDueAmount = Math.max(
        0,
        newPurchaseTotalAmount - (existingItem.purchase?.paidAmount ?? 0)
      );

      await tx
        .update(purchases)
        .set({
          totalAmount: Math.max(0, newPurchaseTotalAmount), // Ensure non-negative
          dueAmount: newDueAmount
        })
        .where(eq(purchases.id, existingItem.purchaseId));
    });

    return {
      data: { message: "Purchase item deleted successfully" },
      success: true
    };
  } catch (error) {
    console.error("Delete purchase item error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "Purchase item not found") {
        return {
          error: "The specified purchase item does not exist",
          success: false
        };
      }

      if (error.message === "Cannot delete items from completed purchase") {
        return {
          error: "Cannot delete items from a completed purchase",
          success: false
        };
      }

      if (error.message.includes("FOREIGN KEY constraint failed")) {
        return {
          error: "Cannot delete purchase item due to associated records",
          success: false
        };
      }
    }

    return {
      error: (error as Error).message || "Failed to delete purchase item",
      success: false
    };
  }
}

// Update stock levels according to purchases controller
export async function updateStockLevelsController(
  purchaseId: string
): Promise<MessageResponseT> {
  try {
    const db = getDB();

    // Validate input
    if (!purchaseId || typeof purchaseId !== "string") {
      return {
        error: "Invalid purchase ID provided",
        success: false
      };
    }

    // Use transaction for data consistency
    const result = await db.transaction(async (tx) => {
      // Check if purchase exists
      const existingPurchase = await tx.query.purchases.findFirst({
        where: eq(purchases.id, purchaseId),
        columns: { id: true, status: true },
        with: {
          purchaseItems: {
            columns: {
              id: true,
              productId: true,
              quantity: true
            },
            with: {
              product: {
                columns: {
                  id: true,
                  name: true,
                  stockQuantity: true
                }
              }
            }
          }
        }
      });

      if (!existingPurchase) {
        throw new Error("Purchase not found");
      }

      // Filter items that have valid products (exclude items without productId)
      const itemsWithProducts = existingPurchase.purchaseItems.filter(
        (item) => item.productId && item.product
      );

      if (itemsWithProducts.length === 0) {
        throw new Error("No products found in this purchase to update stock");
      }

      let updatedProductsCount = 0;
      const updateResults: string[] = [];

      // Update stock for each product
      for (const item of itemsWithProducts) {
        if (item.product) {
          const currentStock = item.product.stockQuantity;
          const newStock = currentStock + item.quantity;

          // Update the product stock
          await tx
            .update(products)
            .set({
              stockQuantity: newStock
            })
            .where(eq(products.id, item.productId!));

          updatedProductsCount++;
          updateResults.push(
            `${item.product.name}: ${currentStock} → ${newStock} (+${item.quantity})`
          );
        }
      }

      return {
        updatedCount: updatedProductsCount,
        details: updateResults
      };
    });

    return {
      data: {
        message: `Stock levels updated successfully for ${result.updatedCount} product(s). Details: ${result.details.join("; ")}`
      },
      success: true
    };
  } catch (error) {
    console.error("Update stock levels error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "Purchase not found") {
        return {
          error: "The specified purchase does not exist",
          success: false
        };
      }

      if (
        error.message === "No products found in this purchase to update stock"
      ) {
        return {
          error: "This purchase contains no products with stock to update",
          success: false
        };
      }

      if (error.message.includes("FOREIGN KEY constraint failed")) {
        return {
          error: "Database constraint error during stock update",
          success: false
        };
      }
    }

    return {
      error: (error as Error).message || "Failed to update stock levels",
      success: false
    };
  }
}
