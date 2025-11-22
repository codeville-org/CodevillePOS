import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { useSecurityStore } from "@/lib/zustand/security-store";
import { useUpdateUser } from "@/modules/users/queries/use-update";
import { useState } from "react";

type Props = {};

export function PasswordSection({}: Props) {
  const { user } = useSecurityStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { mutate, isPending } = useUpdateUser(user?.id || "");

  const handleUpdatePassword = () => {
    if (password !== confirmPassword) {
      toast.error("Passwords aren't matching !");
      return;
    }

    if (!user?.isAdmin) return;

    mutate({ password });
  };

  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Update your account password to enhance security.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <PasswordInput
          value={password}
          placeholder="Enter new password"
          className="h-12"
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          className="h-12"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </CardContent>

      <CardFooter>
        <Button onClick={handleUpdatePassword} loading={isPending}>
          Update Password
        </Button>
      </CardFooter>
    </Card>
  );
}
