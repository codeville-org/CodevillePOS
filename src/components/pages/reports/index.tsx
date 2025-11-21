import {
  ArrowDown,
  DollarSign,
  Loader,
  Package,
  Receipt,
  TrendingUp
} from "lucide-react";
import { useState } from "react";

import PageContainer from "@/components/layouts/dashboard/page-container";
import { AppPageShell } from "@/components/layouts/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { TEXTS } from "@/lib/language";
import { formatPrice } from "@/lib/utils";
import { AnalyticsQueryParamsSchema } from "@/lib/zod/reports.zod";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { useGetReportsAnalytics } from "@/modules/reports/queries/use-get-analytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts";

type Props = {};

const COLORS = [
  "#10B981", // Primary green color
  "#06B6D4", // Chart-2 cyan
  "#8B5CF6", // Chart-3 purple
  "#F59E0B", // Chart-4 amber
  "#EF4444" // Chart-5 red
];

export function ReportsPage({}: Props) {
  const { language } = usePersistStore();
  const [dateRange] = useState<AnalyticsQueryParamsSchema>({});

  const { data, isLoading, error } = useGetReportsAnalytics(dateRange);

  if (isLoading) {
    return (
      <PageContainer scrollable={false}>
        <div className="flex flex-1 items-center justify-center h-full">
          <div className="p-3 rounded-full bg-secondary">
            <Loader className="animate-spin size-6 text-secondary-foreground" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer scrollable={false}>
        <div className="flex flex-1 items-center justify-center h-full">
          <div className="text-destructive">
            Error loading analytics: {error.message}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!data) return null;

  const chartConfig: ChartConfig = {
    sales: {
      label: "Sales",
      color: "#10B981"
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-col w-full h-full gap-6 pb-6">
        <AppPageShell
          title={TEXTS.reports.title[language]}
          description={TEXTS.reports.subtitle[language]}
          actionComponent={undefined}
        />

        <Separator />

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today Transactions
              </CardTitle>
              <Receipt className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {data.overview.todayTransactions || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today Income
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(data.overview.todayIncome || 0, language)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Revenue today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today Average Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(data.overview.todayAverageIncome || 0, language)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per transaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {data.overview.totalProducts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">In inventory</p>
            </CardContent>
          </Card>
        </div>

        {/* Full Width Sales Overview Bar Chart */}
        <Card className="overflow-hidden p-0">
          <CardHeader className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Today's Sales by Hour
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Real-time hourly sales performance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right bg-card/80 rounded-lg px-4 py-2 border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {formatPrice(data.overview.todayIncome || 0, language)}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-hidden">
            <ChartContainer
              config={chartConfig}
              className="h-[280px] w-full min-w-0"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={data.hourlySales || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(value) => `${value}:00`}
                    axisLine={false}
                    tickLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="font-medium mb-2">
                              {label}:00 - {label + 1}:00
                            </p>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: payload[0].color }}
                              />
                              <span className="text-sm text-muted-foreground">
                                Sales:
                              </span>
                              <span className="font-bold">
                                {formatPrice(
                                  Number(payload[0].value),
                                  language
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="#10B981"
                    name="Sales (LKR)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Transaction Count by Hour Bar Chart */}
        <Card className="overflow-hidden p-0">
          <CardHeader className="p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
                  <Receipt className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Today's Transactions by Hour
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Hourly transaction volume throughout the day
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right bg-card/80 rounded-lg px-4 py-2 border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                    {data.overview.todayTransactions || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-hidden">
            <ChartContainer
              config={{
                transactions: {
                  label: "Transactions",
                  color: "#06B6D4"
                }
              }}
              className="h-[280px] w-full min-w-0"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={data.hourlyTransactions || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(value) => `${value}:00`}
                    axisLine={false}
                    tickLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="font-medium mb-2">
                              {label}:00 - {label + 1}:00
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-cyan-500" />
                              <span className="text-sm text-muted-foreground">
                                Transactions:
                              </span>
                              <span className="font-bold">
                                {payload[0].value}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="transactions"
                    fill="#06B6D4"
                    name="Transactions"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Two Column Section: Top Products Pie Chart & Low Stock Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Selling Products Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center overflow-hidden">
              <ChartContainer
                config={chartConfig}
                className="h-[350px] w-full min-w-0"
              >
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={data.topProducts.slice(0, 6).map((product) => ({
                        name: product.name,
                        value: product.totalSold,
                        revenue: product.revenue
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.topProducts.slice(0, 6).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-md">
                              <div className="grid grid-cols-2 gap-2">
                                <span className="text-xs uppercase text-muted-foreground">
                                  Product
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0].payload.name}
                                </span>
                                <span className="text-xs uppercase text-muted-foreground">
                                  Sold
                                </span>
                                <span className="font-bold">
                                  {payload[0].value} units
                                </span>
                                <span className="text-xs uppercase text-muted-foreground">
                                  Revenue
                                </span>
                                <span className="font-bold">
                                  {formatPrice(
                                    Number(payload[0].payload.revenue),
                                    language
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card
            className={
              data.lowStockProducts.length > 0 ? "border-destructive/50" : ""
            }
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${data.lowStockProducts.length > 0 ? "text-destructive" : ""}`}
              >
                <Package className="h-5 w-5" />
                Low Stock Alerts
                {data.lowStockProducts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {data.lowStockProducts.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.lowStockProducts.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {data.lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        {product.barcode && (
                          <p className="text-xs text-muted-foreground">
                            {product.barcode}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="destructive"
                        className="ml-2 flex items-center gap-1"
                      >
                        <ArrowDown className="h-3 w-3" />
                        {product.stockQuantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No low stock alerts at the moment
                  </p>
                  <p className="text-sm text-muted-foreground">
                    All products are well stocked
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
