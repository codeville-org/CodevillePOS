"use client";

import {
  BanknoteIcon,
  BarChart3,
  CodeSquareIcon,
  NotebookPen,
  PackageIcon,
  Settings,
  ShoppingCart,
  UserCircle2Icon,
  Users,
  Warehouse
} from "lucide-react";
import * as React from "react";

import { ThemeToggle } from "@/components/elements/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail
} from "@/components/ui/sidebar";
import { CONSTANTS } from "@/lib/constants";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { useSecurityStore } from "@/lib/zustand/security-store";
import { NavMain } from "./nav-main";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { language } = usePersistStore();
  const { user } = useSecurityStore();

  const isAdmin = user?.isAdmin;

  // Dynamic navigation data based on current language
  const navMainData = [
    {
      key: "pos",
      title: CONSTANTS.SIDEBAR.pos.text[language],
      url: "/",
      icon: ShoppingCart
    },
    {
      key: "inventory",
      title: CONSTANTS.SIDEBAR.inventory.text[language],
      url: "/products",
      icon: Warehouse,
      items: [
        {
          title: CONSTANTS.SIDEBAR.products.items.allProducts[language],
          url: "/products"
        },
        {
          title: CONSTANTS.SIDEBAR.products.items.newProduct[language],
          url: "/products/new"
        },
        {
          title: CONSTANTS.SIDEBAR.products.items.categories[language],
          url: "/products/categories"
        }
      ]
    },
    {
      key: "customers",
      title: CONSTANTS.SIDEBAR.customers.text[language],
      url: "/customers",
      icon: Users
    },
    {
      key: "transactions",
      title: CONSTANTS.SIDEBAR.transactions.text[language],
      url: "/transactions",
      icon: NotebookPen
    },
    // Only show Users and Reports to Admin users
    ...(isAdmin
      ? [
          {
            key: "reports",
            title: CONSTANTS.SIDEBAR.reports.text[language],
            url: "/reports",
            icon: BarChart3
          },
          {
            key: "users",
            title: CONSTANTS.SIDEBAR.users.text[language],
            url: "/users",
            icon: UserCircle2Icon
          },
          {
            key: "cashflow",
            title: CONSTANTS.SIDEBAR.cashflow.text[language],
            url: "/cashflow",
            icon: BanknoteIcon
          },
          {
            key: "supplier_management",
            title: CONSTANTS.SIDEBAR.supplierManagement.text[language],
            url: "/supplier-management/vendors",
            icon: PackageIcon,
            items: [
              {
                title:
                  CONSTANTS.SIDEBAR.supplierManagement.items.vendors[language],
                url: "/supplier-management/vendors"
              },
              {
                title:
                  CONSTANTS.SIDEBAR.supplierManagement.items.purchases[
                    language
                  ],
                url: "/supplier-management/purchases"
              }
              // {
              //   title:
              //     CONSTANTS.SIDEBAR.supplierManagement.items.newPurchase[
              //       language
              //     ],
              //   url: "/supplier-management/purchases"
              // },
            ]
          },
          {
            key: "settings",
            title: CONSTANTS.SIDEBAR.settings.text[language],
            url: "/settings",
            icon: Settings
          }
        ]
      : [])
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent hover:bg-transparent focus:bg-transparent hover:text-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <CodeSquareIcon className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">CodeVille POS</span>
            <span className="truncate text-xs">CodeVille LTD.</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
      </SidebarContent>
      <SidebarFooter className="pb-5">
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
