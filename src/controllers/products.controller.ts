import { app, dialog } from "electron";
import * as fs from "fs/promises";
import path from "path";

import { getDB } from "@/database";
import { categories, products } from "@/database/schema";
import { ProductsQueryParamsSchema } from "@/lib/zod/helpers";
import {
  CreateProductResponse,
  DeleteProductResponse,
  ExportProductsResponse,
  GetProductByBarcodeResponse,
  GetProductByIDResponse,
  ImportProductsResponse,
  ImportProductsSchema,
  InsertProductSchema,
  SelectImportFileType,
  UpdateProductResponse,
  UpdateProductSchema,
  type GetAllProductsResponse
} from "@/lib/zod/products.zod";
import { and, desc, eq, sql } from "drizzle-orm";

// ================= Get all products Controller =================
export async function getAllProductsController(
  query: ProductsQueryParamsSchema
): Promise<GetAllProductsResponse> {
  try {
    const db = getDB();
    const { search, page, limit, sort, category, featured } = query;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // Cap at 100 items
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const whereConditions: any[] = [];

    if (search) {
      whereConditions.push(
        sql`LOWER(${products.name}) LIKE LOWER(${`%${search}%`})`
      );
    }

    if (category) {
      whereConditions.push(sql`${products.categoryId} = ${category}`);
    }

    if (featured) {
      whereConditions.push(sql`${products.isFeatured} = true`);
    }

    db.query.products.findMany({
      where: whereConditions.length ? and(...whereConditions) : undefined,
      orderBy:
        sort.toLowerCase() === "asc"
          ? products.createdAt
          : desc(products.createdAt),
      limit: limitNum,
      offset,
      with: {
        category: true
      }
    });

    const productsQuery = db.query.products.findMany({
      where: whereConditions.length ? and(...whereConditions) : undefined,
      orderBy:
        sort.toLowerCase() === "asc"
          ? products.createdAt
          : desc(products.createdAt),
      limit: limitNum,
      offset,
      with: {
        category: true
      }
    });

    // Get total count for pagination metadata
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereConditions.length ? and(...whereConditions) : undefined);

    const [productEntries, _totalCount] = await Promise.all([
      productsQuery,
      totalCountQuery
    ]);

    const totalCount = _totalCount[0]?.count || 0;

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);

    return {
      data: {
        data: productEntries,
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
      success: false,
      error: (error as Error).message
    };
  }
}

// ================= Get Product by ID =================
export async function getProductByIDController(
  id: string
): Promise<GetProductByIDResponse> {
  try {
    const db = getDB();

    const product = await db.query.products.findFirst({
      where: (fields, { eq }) => {
        return eq(fields.id, id);
      },
      with: {
        category: true
      }
    });

    if (!product) throw new Error("Product not found");

    return {
      success: true,
      error: null,
      data: product
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// ================= Get Product by barcode =================
export async function getProductByBarcodeController(
  barcode: string
): Promise<GetProductByBarcodeResponse> {
  try {
    const db = getDB();

    const product = await db.query.products.findFirst({
      where: (fields, { eq }) => {
        return eq(fields.barcode, barcode);
      }
    });

    if (!product) throw new Error("Product not found");

    return {
      success: true,
      error: null,
      data: product
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// ================= Create new prduct =================
export async function createNewProductController(
  payload: InsertProductSchema
): Promise<CreateProductResponse> {
  try {
    const db = getDB();

    const [inserted] = await db
      .insert(products)
      .values({
        name: payload.name,
        barcode: payload.barcode,
        discountedPrice: payload.discountedPrice,
        stockQuantity: payload.stockQuantity,
        unitPrice: payload.unitPrice,
        unitAmount: payload.unitAmount,
        unit: payload.unit,
        description: payload.description,
        imageFilename: payload.imageFilename,
        isActive: payload.isActive,
        categoryId: payload.categoryId
      })
      .returning();

    return {
      data: inserted,
      success: true,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// ================= Update product =================
export async function updateProductController(
  id: string,
  payload: UpdateProductSchema
): Promise<UpdateProductResponse> {
  try {
    const db = getDB();

    const [updated] = await db
      .update(products)
      .set(payload)
      .where(eq(products.id, id))
      .returning();

    if (!updated) throw new Error("Failed to update product");

    return {
      data: updated,
      success: true,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// ================= Delete Product =================
export async function deleteProductController(
  id: string
): Promise<DeleteProductResponse> {
  try {
    const db = getDB();

    await db.delete(products).where(eq(products.id, id)).returning();

    return {
      data: { message: "Product deleted successfully" },
      success: true,
      error: null
    };
  } catch (error) {
    const errorMessage = (error as Error).message;

    return {
      success: false,
      error: errorMessage
    };
  }
}

// ================= Import Products =================
export async function importProductsController(
  payload: ImportProductsSchema
): Promise<ImportProductsResponse> {
  try {
    const db = getDB();
    const { filePath } = payload;

    // Read CSV file
    const csvContent = await fs.readFile(filePath, "utf8");

    // Parse CSV manually (simple CSV parser)
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      throw new Error(
        "CSV file must contain at least a header row and one data row"
      );
    }

    // Parse header
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"(.*)"$/, "$1"));

    // Validate required headers
    const requiredHeaders = ["name", "unitPrice"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        // Parse CSV row (handle quoted values)
        const values = parseCsvRow(lines[i]);

        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch`);
          errorCount++;
          continue;
        }

        // Create object from headers and values
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });

        // Validate required fields
        if (!rowData.name || !rowData.unitPrice) {
          errors.push(
            `Row ${i + 1}: Missing required fields (name, unitPrice)`
          );
          errorCount++;
          continue;
        }

        // Find or create category
        let categoryId = null;
        if (rowData.categoryName) {
          let category = await db
            .select()
            .from(categories)
            .where(eq(categories.name, rowData.categoryName))
            .limit(1);

          if (category.length === 0) {
            // Create new category
            const newCategory = await db
              .insert(categories)
              .values({ name: rowData.categoryName })
              .returning();
            categoryId = newCategory[0].id;
          } else {
            categoryId = category[0].id;
          }
        }

        // Prepare product data
        const productData = {
          name: rowData.name,
          barcode: rowData.barcode || null,
          categoryId,
          unitPrice: parseFloat(rowData.unitPrice) || 0,
          unitAmount: parseInt(rowData.unitAmount) || 1,
          unit: rowData.unit || "pcs",
          discountedPrice:
            parseFloat(rowData.discountedPrice) ||
            parseFloat(rowData.unitPrice) ||
            0,
          stockQuantity: parseInt(rowData.stockQuantity) || 0,
          description: rowData.description || null,
          imageFilename: null as string | null,
          isActive:
            rowData.isActive === "true" || rowData.isActive === true || true,
          isFeatured:
            rowData.isFeatured === "true" ||
            rowData.isFeatured === true ||
            false
        };

        // Insert product
        await db.insert(products).values(productData);
        successCount++;
      } catch (rowError) {
        errors.push(`Row ${i + 1}: ${(rowError as Error).message}`);
        errorCount++;
      }
    }

    if (successCount === 0) {
      throw new Error(`Import failed. Errors: ${errors.join("; ")}`);
    }

    return {
      data: {},
      success: true,
      error:
        errorCount > 0
          ? `Import completed with warnings. ${successCount} products imported, ${errorCount} errors. Errors: ${errors.join("; ")}`
          : null
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error)?.message || "Failed to import products !"
    };
  }
}

// ================= Select Import File =================
export async function selectImportFileController(): Promise<SelectImportFileType> {
  try {
    const result = await dialog.showOpenDialog({
      title: "Select CSV file to import",
      filters: [
        { name: "CSV Files", extensions: ["csv"] },
        { name: "All Files", extensions: ["*"] }
      ],
      properties: ["openFile"]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return {
        success: false,
        error: "File selection canceled"
      };
    }

    return {
      success: true,
      filePath: result.filePaths[0]
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || "Failed to select file"
    };
  }
}

// Helper function to parse CSV row handling quoted values
function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < row.length) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Handle escaped quotes
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = "";
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

// ================= Export Products =================
export function getExportDirectory(): string {
  let baseDir: string;

  if (!app.isReady()) {
    return path.join(process.cwd(), "images");
  }

  if (app.isPackaged) {
    // Save all exports in user's Downloads/CodeVille POS/exports
    baseDir = app.getPath("downloads");
    return path.join(baseDir, "CodeVille POS", "exports");
  } else {
    baseDir = process.cwd();
    return path.join(baseDir, "exports");
  }
}

export async function exportProductsController(): Promise<ExportProductsResponse> {
  try {
    const db = getDB();

    // Get all products with their categories
    const allProducts = await db
      .select({
        name: products.name,
        barcode: products.barcode,
        categoryName: categories.name,
        unitPrice: products.unitPrice,
        unitAmount: products.unitAmount,
        unit: products.unit,
        discountedPrice: products.discountedPrice,
        stockQuantity: products.stockQuantity,
        description: products.description,
        isActive: products.isActive,
        isFeatured: products.isFeatured
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(products.name);

    // Open save dialog to let user choose export location
    const result = await dialog.showSaveDialog({
      title: "Export Products",
      defaultPath: `products-export-${new Date().toISOString().split("T")[0]}.csv`,
      filters: [
        { name: "CSV Files", extensions: ["csv"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return {
        success: false,
        error: "Export canceled by user"
      };
    }

    // Prepare CSV headers
    const headers = [
      "name",
      "barcode",
      "categoryName",
      "unitPrice",
      "unitAmount",
      "unit",
      "discountedPrice",
      "stockQuantity",
      "description",
      "isActive",
      "isFeatured"
    ];

    // Convert data to CSV format
    const csvRows = [headers.join(",")];

    for (const product of allProducts) {
      const row = [
        `"${(product.name || "").replace(/"/g, '""')}"`,
        `"${(product.barcode || "").replace(/"/g, '""')}"`,
        `"${(product.categoryName || "").replace(/"/g, '""')}"`,
        product.unitPrice || 0,
        product.unitAmount || 1,
        `"${(product.unit || "pcs").replace(/"/g, '""')}"`,
        product.discountedPrice || 0,
        product.stockQuantity || 0,
        `"${(product.description || "").replace(/"/g, '""')}"`,
        product.isActive ? "true" : "false",
        product.isFeatured ? "true" : "false"
      ];
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");

    // Write to file
    await fs.writeFile(result.filePath, csvContent, "utf8");

    return {
      success: true,
      data: {}
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || "Failed to export products !"
    };
  }
}
