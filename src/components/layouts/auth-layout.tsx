import { Loader2 } from "lucide-react";
import React from "react";

import { useSecurityStore } from "@/lib/zustand/security-store";
import { LoginForm } from "@/modules/auth/login-form";
import { useGetSettings } from "@/modules/settings/query/use-get";

type Props = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: Props) {
  const { isAuthenticated } = useSecurityStore();
  const { data, error, isPending } = useGetSettings();

  if (isPending) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  if (isAuthenticated || data.password === "" || error) {
    return <>{children}</>;
  }

  if (data.password !== "") {
    return <LoginForm />;
  }
}
