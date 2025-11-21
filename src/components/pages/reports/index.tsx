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
import {
  DateRangeFilter,
  DateRangeFilterValue
} from "@/modules/reports/components/date-range-filter";
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
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return {
      type: "today",
      startDate: today,
      endDate: endOfDay
    };
  });

  // Convert DateRangeFilterValue to AnalyticsQueryParamsSchema
  const queryParams: AnalyticsQueryParamsSchema = {
    filterType: dateFilter.type,
    startDate: dateFilter.startDate?.toISOString(),
    endDate: dateFilter.endDate?.toISOString()
  };

  const { data, isLoading, error } = useGetReportsAnalytics(queryParams);

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
          actionComponent={
            <DateRangeFilter
              value={dateFilter}
              onChange={setDateFilter}
              className="flex-shrink-0"
            />
          }
        />

        <Separator />

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Today Transactions */}
          <Card className="group relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-primary/5 opacity-60 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {dateFilter.type === "today"
                    ? TEXTS.reports.filters.today[language]
                    : dateFilter.type === "week"
                      ? TEXTS.reports.filters.thisWeek[language]
                      : dateFilter.type === "month"
                        ? TEXTS.reports.filters.thisMonth[language]
                        : dateFilter.type === "quarter"
                          ? TEXTS.reports.filters.thisQuarter[language]
                          : "Period"}{" "}
                  {TEXTS.reports.overview.transactions[language]}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold tabular-nums text-primary">
                  {data.overview.periodTransactions || 0}
                </div>
                <span className="text-[11px] rounded-md border px-2 py-1 bg-muted/40 text-muted-foreground">
                  Completed
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Activity up-to current hour
              </p>
            </CardContent>
          </Card>

          {/* Card: Today Income */}
          <Card className="group relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-emerald-500/5 opacity-60 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {dateFilter.type === "today"
                    ? TEXTS.reports.filters.today[language]
                    : dateFilter.type === "week"
                      ? TEXTS.reports.filters.thisWeek[language]
                      : dateFilter.type === "month"
                        ? TEXTS.reports.filters.thisMonth[language]
                        : dateFilter.type === "quarter"
                          ? TEXTS.reports.filters.thisQuarter[language]
                          : "Period"}{" "}
                  {TEXTS.reports.overview.income[language]}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatPrice(data.overview.periodIncome || 0, language)}
                </div>
                {/* <span className="text-[11px] rounded-md border px-2 py-1 bg-muted/40 text-muted-foreground">
                  Revenue
                </span> */}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {dateFilter.type === "today"
                  ? "Gross sales today"
                  : "Gross sales for selected period"}
              </p>
            </CardContent>
          </Card>

          {/* Card: Sold Items */}
          <Card className="group relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-amber-500/5 opacity-60 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Package className="h-5 w-5" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {dateFilter.type === "today"
                    ? TEXTS.reports.filters.today[language]
                    : dateFilter.type === "week"
                      ? TEXTS.reports.filters.thisWeek[language]
                      : dateFilter.type === "month"
                        ? TEXTS.reports.filters.thisMonth[language]
                        : dateFilter.type === "quarter"
                          ? TEXTS.reports.filters.thisQuarter[language]
                          : "Period"}{" "}
                  {TEXTS.reports.overview.soldItems[language]}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {data.overview.periodSoldItems || 0}
                </div>
                <span className="text-[11px] rounded-md border px-2 py-1 bg-muted/40 text-muted-foreground">
                  Units
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {dateFilter.type === "today"
                  ? "Items sold today"
                  : "Items sold for selected period"}
              </p>
            </CardContent>
          </Card>

          {/* Card: Today Average Income */}
          <Card className="group relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-indigo-500/5 opacity-60 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {TEXTS.reports.overview.avgIncome[language]}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                  {formatPrice(
                    data.overview.periodAverageIncome || 0,
                    language
                  )}
                </div>
                {/* <span className="text-[11px] rounded-md border px-2 py-1 bg-muted/40 text-muted-foreground">
                  Per txn
                </span> */}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Average per completed transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Count by Hour Bar Chart */}
        <Card className="overflow-hidden p-0">
          <CardHeader className="p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 border-b backdrop-blur supports-[backdrop-filter]:bg-cyan-50/80 dark:supports-[backdrop-filter]:bg-cyan-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg shadow-inner shadow-cyan-200/40 dark:shadow-cyan-800/30">
                  <Receipt className="h-5 w-5 text-cyan-600 dark:text-cyan-400 drop-shadow-sm" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {dateFilter.type === "today" ? "Today's" : "Period"}{" "}
                    Transactions by{" "}
                    {data.hourlyTransactions[0]?.hour !== undefined
                      ? "Hour"
                      : "Day"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.hourlyTransactions[0]?.hour !== undefined
                      ? "Hourly transaction volume throughout the day"
                      : "Daily transaction volume for the selected period"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right bg-card/80 rounded-lg px-4 py-2 border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {dateFilter.type === "today" ? "Today" : "Period"}{" "}
                    Transactions
                  </p>
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                    {data.overview.periodTransactions || 0}
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
                  <defs>
                    <linearGradient
                      id="transactionsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#06B6D4"
                        stopOpacity={0.25}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey={
                      data.hourlyTransactions[0]?.hour !== undefined
                        ? "hour"
                        : "date"
                    }
                    tickFormatter={(value) => {
                      if (data.hourlyTransactions[0]?.hour !== undefined) {
                        return `${value}:00`;
                      } else {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric"
                        });
                      }
                    }}
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
                        const isHourly =
                          data.hourlyTransactions[0]?.hour !== undefined;
                        data.hourlyTransactions[0]?.hour !== undefined;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="font-medium mb-2">
                              {isHourly
                                ? `${label}:00 - ${label + 1}:00`
                                : new Date(label).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })}
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
                    fill="url(#transactionsGradient)"
                    name="Transactions"
                    radius={[4, 4, 0, 0]}
                    className="transition-all duration-300"
                    isAnimationActive
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Full Width Sales Overview Bar Chart */}
        <Card className="overflow-hidden p-0">
          <CardHeader className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b backdrop-blur supports-[backdrop-filter]:bg-primary/5/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shadow-inner shadow-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary drop-shadow-sm" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {dateFilter.type === "today" ? "Today's" : "Period"} Sales
                    by{" "}
                    {data.hourlySales[0]?.hour !== undefined ? "Hour" : "Day"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.hourlySales[0]?.hour !== undefined
                      ? "Real-time hourly sales performance"
                      : "Daily sales performance for the selected period"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right bg-card/80 rounded-lg px-4 py-2 border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {dateFilter.type === "today" ? "Today" : "Period"} Income
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {formatPrice(data.overview.periodIncome || 0, language)}
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
                  <defs>
                    <linearGradient
                      id="salesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#10B981"
                        stopOpacity={0.25}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey={
                      data.hourlySales[0]?.hour !== undefined ? "hour" : "date"
                    }
                    tickFormatter={(value) => {
                      if (data.hourlySales[0]?.hour !== undefined) {
                        return `${value}:00`;
                      } else {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric"
                        });
                      }
                    }}
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
                        const isHourly =
                          data.hourlySales[0]?.hour !== undefined;
                        data.hourlySales[0]?.hour !== undefined;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="font-medium mb-2">
                              {isHourly
                                ? `${label}:00 - ${label + 1}:00`
                                : new Date(label).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })}
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
                    fill="url(#salesGradient)"
                    name="Sales (LKR)"
                    radius={[4, 4, 0, 0]}
                    className="transition-all duration-300"
                    isAnimationActive
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
