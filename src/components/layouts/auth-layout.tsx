import React from "react";

import { useSecurityStore } from "@/lib/zustand/security-store";
import { LoginForm } from "@/modules/auth/login-form";

type Props = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: Props) {
  const { isAuthenticated, user } = useSecurityStore();

  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // If not authenticated, show login form
  return <LoginForm />;
}
