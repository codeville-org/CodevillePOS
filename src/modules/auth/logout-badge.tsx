import { useSecurityStore } from "@/lib/zustand/security-store";
import { LogOutIcon } from "lucide-react";

type Props = {};

export function LogoutBadge({}: Props) {
  const { logout, isAuthenticated } = useSecurityStore();

  const handleLogout = async () => {
    logout();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className="bg-destructive/10 hover:bg-destructive/20 text-destructive dark:bg-destructive/90 dark:hover:bg-destructive cursor-pointer dark:text-destructive-foreground p-1 rounded-full"
      onClick={handleLogout}
    >
      <LogOutIcon className="size-3" />
    </div>
  );
}
