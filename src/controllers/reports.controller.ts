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

    // Helper function to get date range based on filter type
    const getDateRangeFromFilter = (
      filterType?: string,
      startDate?: string,
      endDate?: string
    ) => {
      const now = new Date();

      if (startDate && endDate) {
        return {
          start: new Date(startDate),
          end: new Date(endDate)
        };
      }

      switch (filterType) {
        case "today": {
          const today = new Date(now);
          today.setHours(0, 0, 0, 0);
          const endOfDay = new Date(today);
          endOfDay.setHours(23, 59, 59, 999);
          return { start: today, end: endOfDay };
        }

        case "week": {
          const today = new Date(now);
          today.setHours(0, 0, 0, 0);
          const dayOfWeek = today.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - daysToMonday);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          return { start: startOfWeek, end: endOfWeek };
        }

        case "month": {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 999);
          return { start: startOfMonth, end: endOfMonth };
        }

        case "quarter": {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const startOfQuarter = new Date(
            now.getFullYear(),
            currentQuarter * 3,
            1
          );
          const endOfQuarter = new Date(
            now.getFullYear(),
            currentQuarter * 3 + 3,
            0
          );
          endOfQuarter.setHours(23, 59, 59, 999);
          return { start: startOfQuarter, end: endOfQuarter };
        }

        default: {
          // Default to last month for backward compatibility
          const defaultStart = new Date(now);
          defaultStart.setMonth(now.getMonth() - 1);
          return { start: defaultStart, end: now };
        }
      }
    };

    // Get date range based on params
    const dateRange = getDateRangeFromFilter(
      params?.filterType,
      params?.startDate,
      params?.endDate
    );
    const startTimestamp = Math.floor(dateRange.start.getTime() / 1000);
    const endTimestamp = Math.floor(dateRange.end.getTime() / 1000);

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

    // Today's Statistics
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayStartTimestamp = Math.floor(todayStart.getTime() / 1000);
    const todayEndTimestamp = Math.floor(todayEnd.getTime() / 1000);

    const todayTransactionsResult = await db
      .select({
        count: count(),
        totalAmount: sum(transactions.totalAmount)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "completed"),
          sql`${transactions.createdAt} >= ${todayStartTimestamp}`,
          sql`${transactions.createdAt} <= ${todayEndTimestamp}`
        )
      );

    const todayTransactions = todayTransactionsResult[0]?.count || 0;
    const todayIncome = Number(todayTransactionsResult[0]?.totalAmount || 0);
    const todayAverageIncome =
      todayTransactions > 0 ? todayIncome / todayTransactions : 0;

    // Period-specific Statistics (based on selected date range)
    const periodTransactionsResult = await db
      .select({
        count: count(),
        totalAmount: sum(transactions.totalAmount)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "completed"),
          sql`${transactions.createdAt} >= ${startTimestamp}`,
          sql`${transactions.createdAt} <= ${endTimestamp}`
        )
      );

    const periodTransactions = periodTransactionsResult[0]?.count || 0;
    const periodIncome = Number(periodTransactionsResult[0]?.totalAmount || 0);
    const periodAverageIncome =
      periodTransactions > 0 ? periodIncome / periodTransactions : 0;

    // Determine if we should show hourly data (only for today and single day ranges)
    const showHourlyData =
      params?.filterType === "today" ||
      dateRange.start.toDateString() === dateRange.end.toDateString();

    let salesChartData: Array<{ hour?: number; date?: string; sales: number }> =
      [];
    let transactionsChartData: Array<{
      hour?: number;
      date?: string;
      transactions: number;
    }> = [];

    if (showHourlyData) {
      // Hourly Sales - Using local time (UTC+5:30 for Sri Lanka)
      const hourlySalesData = await db
        .select({
          hour: sql<number>`CAST(strftime('%H', datetime(${transactions.createdAt}, 'unixepoch', 'localtime')) AS INTEGER)`,
          sales: sum(transactions.totalAmount)
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.status, "completed"),
            sql`${transactions.createdAt} >= ${startTimestamp}`,
            sql`${transactions.createdAt} <= ${endTimestamp}`
          )
        )
        .groupBy(
          sql`CAST(strftime('%H', datetime(${transactions.createdAt}, 'unixepoch', 'localtime')) AS INTEGER)`
        )
        .orderBy(
          sql`CAST(strftime('%H', datetime(${transactions.createdAt}, 'unixepoch', 'localtime')) AS INTEGER)`
        );

      // Create complete hourly sales data (0-23 hours)
      salesChartData = Array.from({ length: 24 }, (_, hour) => {
        const existingData = hourlySalesData.find((item) => item.hour === hour);
        return {
          hour,
          sales: Number(existingData?.sales || 0)
        };
      });
    } else {
      // Daily Sales for multi-day periods
      const dailySalesData = await db
        .select({
          date: sql<string>`DATE(datetime(${transactions.createdAt}, 'unixepoch', 'localtime'))`,
          sales: sum(transactions.totalAmount)
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.status, "completed"),
            sql`${transactions.createdAt} >= ${startTimestamp}`,
            sql`${transactions.createdAt} <= ${endTimestamp}`
          )
        )
        .groupBy(
          sql`DATE(datetime(${transactions.createdAt}, 'unixepoch', 'localtime'))`
        )
        .orderBy(
          sql`DATE(datetime(${transactions.createdAt}, 'unixepoch', 'localtime'))`
        );

      // Generate all dates in the range
      const currentDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const existingData = dailySalesData.find(
          (item) => item.date === dateStr
        );

        salesChartData.push({
          date: dateStr,
          sales: Number(existingData?.sales || 0)
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    if (showHourlyData) {
      // Hourly Transactions - Using local time (UTC+5:30 for Sri Lanka)
      const hourlyTransactionsData = await db
        .select({
          hour: sql<number>`CAST(strftime('%H', datetime(${transactions.createdAt}, 'unixepoch', 'localtime')) AS INTEGER)`,
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
        .groupBy(
          sql`CAST(strftime('%H', datetime(${transactions.createdAt}, 'unixepoch', 'localtime')) AS INTEGER)`
        )
        .orderBy(
          sql`CAST(strftime('%H', datetime(${transactions.createdAt}, 'unixepoch', 'localtime')) AS INTEGER)`
        );

      // Create complete hourly transactions data (0-23 hours)
      transactionsChartData = Array.from({ length: 24 }, (_, hour) => {
        const existingData = hourlyTransactionsData.find(
          (item) => item.hour === hour
        );
        return {
          hour,
          transactions: existingData?.transactions || 0
        };
      });
    } else {
      // Daily Transactions for multi-day periods
      const dailyTransactionsData = await db
        .select({
          date: sql<string>`DATE(datetime(${transactions.createdAt}, 'unixepoch', 'localtime'))`,
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
        .groupBy(
          sql`DATE(datetime(${transactions.createdAt}, 'unixepoch', 'localtime'))`
        )
        .orderBy(
          sql`DATE(datetime(${transactions.createdAt}, 'unixepoch', 'localtime'))`
        );

      // Generate all dates in the range for transactions
      const currentDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const existingData = dailyTransactionsData.find(
          (item) => item.date === dateStr
        );

        transactionsChartData.push({
          date: dateStr,
          transactions: existingData?.transactions || 0
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Sales Trend (Last 7 days) - keeping for compatibility
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
          averageOrderValue,
          // Period-specific metrics
          periodTransactions,
          periodIncome,
          periodAverageIncome,
          // Keep today metrics for compatibility
          todayTransactions,
          todayIncome,
          todayAverageIncome
        },
        salesTrend,
        hourlySales: salesChartData,
        hourlyTransactions: transactionsChartData,
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
