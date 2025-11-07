import { getDB } from "@/database";
import {
  categories,
  customers,
  products,
  transactionItems,
  transactions
} from "@/database/schema";
import {
  AnalyticsQueryParamsSchema,
  GetAnalyticsResponse
} from "@/lib/zod/reports.zod";
import { and, count, desc, eq, sql, sum } from "drizzle-orm";

// ========= Get Dashboard Analytics =========
export async function getDashboardAnalyticsController(
  params?: AnalyticsQueryParamsSchema
): Promise<GetAnalyticsResponse> {
  try {
    const db = getDB();

    // Date range filtering - Convert string params to Unix timestamps (seconds)
    const startDateObj = params?.startDate
      ? new Date(params.startDate)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDateObj = params?.endDate ? new Date(params.endDate) : new Date();

    // Convert to Unix timestamps (seconds) for SQLite comparison
    const startTimestamp = Math.floor(startDateObj.getTime() / 1000);
    const endTimestamp = Math.floor(endDateObj.getTime() / 1000);

    // Overview Statistics
    const totalSalesResult = await db
      .select({
        total: sum(transactions.totalAmount)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "completed"),
          sql`${transactions.createdAt} >= ${startTimestamp}`,
          sql`${transactions.createdAt} <= ${endTimestamp}`
        )
      );

    const totalTransactionsResult = await db
      .select({
        count: count()
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "completed"),
          sql`${transactions.createdAt} >= ${startTimestamp}`,
          sql`${transactions.createdAt} <= ${endTimestamp}`
        )
      );

    const totalCustomersResult = await db
      .select({
        count: count()
      })
      .from(customers)
      .where(eq(customers.isActive, true));

    const totalProductsResult = await db
      .select({
        count: count()
      })
      .from(products)
      .where(eq(products.isActive, true));

    const totalSales = Number(totalSalesResult[0]?.total || 0);
    const totalTransactions = totalTransactionsResult[0]?.count || 0;
    const averageOrderValue =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Sales Trend (Last 7 days)
    const salesTrendData = await db
      .select({
        date: sql<string>`DATE(${transactions.createdAt}, 'unixepoch')`,
        sales: sum(transactions.totalAmount),
        transactions: count()
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "completed"),
          sql`${transactions.createdAt} >= ${startTimestamp}`,
          sql`${transactions.createdAt} <= ${endTimestamp}`
        )
      )
      .groupBy(sql`DATE(${transactions.createdAt}, 'unixepoch')`)
      .orderBy(sql`DATE(${transactions.createdAt}, 'unixepoch')`);

    const salesTrend = salesTrendData.map((item) => ({
      date: item.date,
      sales: Number(item.sales || 0),
      transactions: item.transactions
    }));

    // Top Products
    const topProductsData = await db
      .select({
        id: products.id,
        name: products.name,
        stockQuantity: products.stockQuantity,
        totalSold: sum(transactionItems.quantity),
        revenue: sum(
          sql<number>`${transactionItems.quantity} * ${transactionItems.unitPrice}`
        )
      })
      .from(transactionItems)
      .innerJoin(products, eq(transactionItems.productId, products.id))
      .innerJoin(
        transactions,
        eq(transactionItems.transactionId, transactions.id)
      )
      .where(
        and(
          eq(transactions.status, "completed"),
          sql`${transactions.createdAt} >= ${startTimestamp}`,
          sql`${transactions.createdAt} <= ${endTimestamp}`
        )
      )
      .groupBy(products.id, products.name, products.stockQuantity)
      .orderBy(desc(sql`SUM(${transactionItems.quantity})`))
      .limit(10);

    const topProducts = topProductsData.map((item) => ({
      id: item.id,
      name: item.name,
      stockQuantity: item.stockQuantity,
      totalSold: Number(item.totalSold || 0),
      revenue: Number(item.revenue || 0)
    }));

    // Top Categories
    const topCategoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
        productCount: count(products.id),
        totalRevenue: sum(
          sql<number>`${transactionItems.quantity} * ${transactionItems.unitPrice}`
        )
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .leftJoin(transactionItems, eq(products.id, transactionItems.productId))
      .leftJoin(
        transactions,
        eq(transactionItems.transactionId, transactions.id)
      )
      .where(
        sql`${transactions.status} = 'completed' AND ${transactions.createdAt} >= ${startTimestamp} AND ${transactions.createdAt} <= ${endTimestamp}`
      )
      .groupBy(categories.id, categories.name)
      .orderBy(
        desc(
          sql`SUM(${transactionItems.quantity} * ${transactionItems.unitPrice})`
        )
      )
      .limit(10);

    const topCategories = topCategoriesData.map((item) => ({
      id: item.id,
      name: item.name,
      productCount: item.productCount,
      totalRevenue: Number(item.totalRevenue || 0)
    }));

    // Top Customers
    const topCustomersData = await db
      .select({
        id: customers.id,
        name: customers.name,
        totalSpent: sum(transactions.totalAmount),
        transactionCount: count(transactions.id)
      })
      .from(customers)
      .innerJoin(transactions, eq(customers.id, transactions.customerId))
      .where(
        and(
          eq(transactions.status, "completed"),
          sql`${transactions.createdAt} >= ${startTimestamp}`,
          sql`${transactions.createdAt} <= ${endTimestamp}`
        )
      )
      .groupBy(customers.id, customers.name)
      .orderBy(desc(sum(transactions.totalAmount)))
      .limit(10);

    const topCustomers = topCustomersData.map((item) => ({
      id: item.id,
      name: item.name,
      totalSpent: Number(item.totalSpent || 0),
      transactionCount: item.transactionCount
    }));

    // Payment Methods Distribution
    const paymentMethodsData = await db
      .select({
        method: transactions.paymentMethod,
        count: count(),
        total: sum(transactions.totalAmount)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "completed"),
          sql`${transactions.createdAt} >= ${startTimestamp}`,
          sql`${transactions.createdAt} <= ${endTimestamp}`
        )
      )
      .groupBy(transactions.paymentMethod);

    const paymentMethods = paymentMethodsData.map((item) => ({
      method: item.method,
      count: item.count,
      total: Number(item.total || 0)
    }));

    // Low Stock Products
    const lowStockData = await db
      .select({
        id: products.id,
        name: products.name,
        stockQuantity: products.stockQuantity,
        barcode: products.barcode
      })
      .from(products)
      .where(
        and(eq(products.isActive, true), sql`${products.stockQuantity} < 10`)
      )
      .orderBy(products.stockQuantity)
      .limit(10);

    const lowStockProducts = lowStockData.map((item) => ({
      id: item.id,
      name: item.name,
      stockQuantity: item.stockQuantity,
      barcode: item.barcode
    }));

    return {
      success: true,
      data: {
        overview: {
          totalSales,
          totalTransactions,
          totalCustomers: totalCustomersResult[0]?.count || 0,
          totalProducts: totalProductsResult[0]?.count || 0,
          averageOrderValue
        },
        salesTrend,
        topProducts,
        topCategories,
        topCustomers,
        paymentMethods,
        lowStockProducts
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
