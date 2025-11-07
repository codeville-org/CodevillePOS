import {
  ArrowDown,
  DollarSign,
  Loader,
  Package,
  Receipt,
  TrendingUp,
  Users
} from "lucide-react";
import { useState } from "react";

import PageContainer from "@/components/layouts/dashboard/page-container";
import { AppPageShell } from "@/components/layouts/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { TEXTS } from "@/lib/language";
import { formatPrice } from "@/lib/utils";
import { AnalyticsQueryParamsSchema } from "@/lib/zod/reports.zod";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { useGetReportsAnalytics } from "@/modules/reports/queries/use-get-analytics";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts";

type Props = {};

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

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
      color: "#8b5cf6"
    },
    transactions: {
      label: "Transactions",
      color: "#06b6d4"
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {TEXTS.reports.overview.totalSales[language]}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(data.overview.totalSales, language)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.overview.totalTransactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {TEXTS.reports.overview.totalTransactions[language]}
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.overview.totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {TEXTS.reports.overview.totalCustomers[language]}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.overview.totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {TEXTS.reports.overview.totalProducts[language]}
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.overview.totalProducts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">In inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {TEXTS.reports.overview.averageOrderValue[language]}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(data.overview.averageOrderValue, language)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per order</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                {TEXTS.reports.sections.salesTrend[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--color-sales)"
                      strokeWidth={2}
                      name="Sales (LKR)"
                    />
                    <Line
                      type="monotone"
                      dataKey="transactions"
                      stroke="var(--color-transactions)"
                      strokeWidth={2}
                      name="Transactions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Payment Methods Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                {TEXTS.reports.sections.paymentMethods[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, count }) => `${method}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {data.paymentMethods.map((_, index) => (
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
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Method
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0].payload.method}
                                </span>
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Amount
                                </span>
                                <span className="font-bold">
                                  {formatPrice(
                                    Number(payload[0].value),
                                    language
                                  )}
                                </span>
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Count
                                </span>
                                <span className="font-bold">
                                  {payload[0].payload.count}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>
              {TEXTS.reports.sections.topProducts[language]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stockQuantity} units
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatPrice(product.revenue, language)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.totalSold} sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle>
                {TEXTS.reports.sections.topCategories[language]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topCategories.slice(0, 5).map((category, index) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.productCount} products
                        </p>
                      </div>
                    </div>
                    <div className="font-bold">
                      {formatPrice(category.totalRevenue, language)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>
                {TEXTS.reports.sections.topCustomers[language]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topCustomers.slice(0, 5).map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.transactionCount} orders
                        </p>
                      </div>
                    </div>
                    <div className="font-bold">
                      {formatPrice(customer.totalSpent, language)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {data.lowStockProducts.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Package className="h-5 w-5" />
                {TEXTS.reports.sections.lowStock[language]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
