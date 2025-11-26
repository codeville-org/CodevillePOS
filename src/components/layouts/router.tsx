import { Navigate, Route, Routes } from "react-router-dom";

import { CashflowPage } from "../pages/cashflow";
import { CategoriesPage } from "../pages/categories";
import { CustomersPage } from "../pages/customers";
import { PosPage } from "../pages/pos";
import { ProductsInventoryPage } from "../pages/products";
import { NewProductPage } from "../pages/products/new-product";
import { SingleProductPage } from "../pages/products/single-product";
import { ReportsPage } from "../pages/reports";
import { SettingsPage } from "../pages/settings";
import { VendorsPage } from "../pages/supplier-management/vendors";
import { TransactionsPage } from "../pages/transactions";
import { UsersPage } from "../pages/users";

type Props = {};

export function AppRouter({}: Props) {
  return (
    <Routes>
      <Route path="/" element={<PosPage />} />
      <Route path="/pos" element={<Navigate to="/" replace />} />
      <Route path="/products" element={<ProductsInventoryPage />} />
      <Route path="/products/new" element={<NewProductPage />} />
      <Route path="/products/:id" element={<SingleProductPage />} />
      <Route path="/products/categories" element={<CategoriesPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/cashflow" element={<CashflowPage />} />
      <Route path="/supplier-management/vendors" element={<VendorsPage />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
