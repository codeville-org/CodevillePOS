import React, { useEffect } from "react";

import { useSecurityStore } from "@/lib/zustand/security-store";
import { LoginForm } from "@/modules/auth/login-form";

type Props = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: Props) {
  const { isAuthenticated, user, latestLoginFootprint, logout } =
    useSecurityStore();

  useEffect(() => {
    // If latest login footprint is older than 1 day, log out the user
    if (latestLoginFootprint) {
      const now = new Date();
      const footprintDate = new Date(latestLoginFootprint);
      const diffInMs = now.getTime() - footprintDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (diffInDays > 1) {
        logout();
      }
    }
  }, [latestLoginFootprint, logout]);

  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // If not authenticated, show login form
  return <LoginForm />;
}
