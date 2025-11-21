import { z } from "zod";
import { getBaseReturnSchema } from "./helpers";

// Date Filter Type Enum
export const dateFilterTypeSchema = z.enum([
  "today",
  "week",
  "month",
  "quarter",
  "custom"
]);

export type DateFilterTypeSchema = z.infer<typeof dateFilterTypeSchema>;

// Analytics Query Parameters Schema
export const analyticsQueryParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  filterType: dateFilterTypeSchema.optional()
});

export type AnalyticsQueryParamsSchema = z.infer<
  typeof analyticsQueryParamsSchema
>;

// Overview Schema
const overviewSchema = z.object({
  totalSales: z.number(),
  totalTransactions: z.number(),
  totalCustomers: z.number(),
  totalProducts: z.number(),
  averageOrderValue: z.number(),
  // Period-specific metrics (based on selected date range)
  periodTransactions: z.number(),
  periodIncome: z.number(),
  periodAverageIncome: z.number(),
  // For backward compatibility
  todayTransactions: z.number(),
  todayIncome: z.number(),
  todayAverageIncome: z.number()
});

export type OverviewSchema = z.infer<typeof overviewSchema>;

// Sales Trend Schema
const salesTrendItemSchema = z.object({
  date: z.string(),
  sales: z.number(),
  transactions: z.number()
});

export type SalesTrendItemSchema = z.infer<typeof salesTrendItemSchema>;

// Chart Data Schema (supports both hourly and daily data)
const chartSalesItemSchema = z.object({
  hour: z.number().optional(),
  date: z.string().optional(),
  sales: z.number()
});

export type ChartSalesItemSchema = z.infer<typeof chartSalesItemSchema>;

// Chart Transactions Schema (supports both hourly and daily data)
const chartTransactionsItemSchema = z.object({
  hour: z.number().optional(),
  date: z.string().optional(),
  transactions: z.number()
});

export type ChartTransactionsItemSchema = z.infer<
  typeof chartTransactionsItemSchema
>;

// Legacy schemas for backward compatibility
const hourlySalesItemSchema = chartSalesItemSchema;
export type HourlySalesItemSchema = ChartSalesItemSchema;

const hourlyTransactionsItemSchema = chartTransactionsItemSchema;
export type HourlyTransactionsItemSchema = ChartTransactionsItemSchema;

// Top Products Schema
const topProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  totalSold: z.number(),
  revenue: z.number(),
  stockQuantity: z.number()
});

export type TopProductSchema = z.infer<typeof topProductSchema>;

// Top Categories Schema
const topCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  productCount: z.number(),
  totalRevenue: z.number()
});

export type TopCategorySchema = z.infer<typeof topCategorySchema>;

// Top Customers Schema
const topCustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  totalSpent: z.number(),
  transactionCount: z.number()
});

export type TopCustomerSchema = z.infer<typeof topCustomerSchema>;

// Payment Methods Schema
const paymentMethodSchema = z.object({
  method: z.string(),
  count: z.number(),
  total: z.number()
});

export type PaymentMethodSchema = z.infer<typeof paymentMethodSchema>;

// Low Stock Products Schema
const lowStockProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  stockQuantity: z.number(),
  barcode: z.string().nullable()
});

export type LowStockProductSchema = z.infer<typeof lowStockProductSchema>;

// Analytics Data Schema (combines all analytics data)
export const analyticsDataSchema = z.object({
  overview: overviewSchema,
  salesTrend: z.array(salesTrendItemSchema),
  hourlySales: z.array(chartSalesItemSchema),
  hourlyTransactions: z.array(chartTransactionsItemSchema),
  topProducts: z.array(topProductSchema),
  topCategories: z.array(topCategorySchema),
  topCustomers: z.array(topCustomerSchema),
  paymentMethods: z.array(paymentMethodSchema),
  lowStockProducts: z.array(lowStockProductSchema)
});

export type AnalyticsDataSchema = z.infer<typeof analyticsDataSchema>;

// End-to-End Response Schema
export const getAnalyticsResponseSchema =
  getBaseReturnSchema(analyticsDataSchema);

export type GetAnalyticsResponse = z.infer<typeof getAnalyticsResponseSchema>;
