import { MoonIcon, PhoneIcon, SunIcon, UnlockIcon } from "lucide-react";
import { useId, useState } from "react";

import authBgImage from "@/assets/images/auth-bg.png";
import codevilleLogoDark from "@/assets/images/logo-dark.png";
import codevilleLogoLight from "@/assets/images/logo-light.png";

import { LanguageSelector } from "@/components/elements/language-selector";
import { WindowActions } from "@/components/layouts/dashboard/window-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TEXTS } from "@/lib/language";
import { cn } from "@/lib/utils";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { useSecurityStore } from "@/lib/zustand/security-store";
import { toast } from "sonner";
import { RealtimeClock } from "../pos/components/clock";

type Props = {
  className?: string;
};

export function LoginForm({ className }: Props) {
  const toastId = useId();
  const { theme, setTheme, language } = usePersistStore();
  const { latestLoginFootprint, login } = useSecurityStore();
  const [password, setPassword] = useState("");

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogin = async () => {
    toast.loading("Logging in...", { id: toastId });

    const res = await login(password);

    if (res.success) {
      toast.success(res.message, { id: toastId });
    } else {
      toast.error(res.message, { id: toastId });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/40">
      {/* Heading */}
      <header className="flex w-full bg-white dark:bg-secondary h-10 border-b shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center h-full w-full gap-2 px-4">
          <div className="h-full w-full flex items-center justify-between">
            <div className="flex-1 flex items-center gap-2">
              <h2 className="font-semibold text-foreground/80 text-sm">
                <span
                  className={
                    cn("font-semibold mr-0.5")
                    // language === "si" ? "font-sinhala text-xs" : "font-sans"
                  }
                >
                  {`CodeVille`}
                </span>
                <span className="font-thin">POS</span>
              </h2>

              <Separator
                className="mx-2 data-[orientation=vertical]:h-4"
                orientation="vertical"
              />

              <div className="flex items-center justify-between w-fit gap-2">
                <span className="flex items-center gap-2 text-xs normal-case">
                  {theme === "dark" ? (
                    <SunIcon className="size-4" />
                  ) : (
                    <MoonIcon className="size-4" />
                  )}
                  {`Theme`} {`(${theme})`}
                </span>

                <Switch
                  id="theme"
                  checked={theme === "dark"}
                  onCheckedChange={handleToggleTheme}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 h-full">
              <RealtimeClock />

              <LanguageSelector />

              <Separator
                className="mx-2 data-[orientation=vertical]:h-4"
                orientation="vertical"
              />

              <WindowActions />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-2 w-full h-full">
        <div className="relative">
          <img
            src={authBgImage}
            alt="Authentication background"
            className="w-full h-full object-cover"
          />

          <div className="h-2/3 w-full absolute z-30 bg-gradient-to-t bottom-0 left-0 from-black/80 to-transparent" />
        </div>

        <div className="flex flex-col items-center justify-center">
          {/*  CodeVille POS Logo */}
          <div className=""></div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="mb-12 flex items-center flex-col justify-center gap-2">
              <img
                src={codevilleLogoLight}
                alt="CodeVille POS Logo"
                className="dark:hidden w-60 object-cover"
              />
              <img
                src={codevilleLogoDark}
                alt="CodeVille POS Logo"
                className="hidden dark:flex w-60 object-cover"
              />

              <p className="text-xs text-foreground/70 text-center">
                {`Empowering Your Grocery Store with Seamless POS Experience`}
              </p>
            </div>

            <Card
              className={cn(
                "p-7 px-9 shadow-none w-full max-w-lg bg-white dark:bg-secondary flex flex-col gap-7",
                className
              )}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <h2 className="mb-1 text-center text-2xl font-black tracking-tight">
                  {latestLoginFootprint
                    ? "😾 System Locked"
                    : "😺 Welcome Back !"}
                </h2>
                <p className="text-center text-sm text-foreground/70">
                  Please login to your account to continue using CodeVille POS.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <PasswordInput
                  placeholder={TEXTS.lockScreen.placeholder[language]}
                  className="h-12 text-center shadow-none rounded-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  // Handle login when enter key is pressed
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && password.trim().length > 0) {
                      handleLogin();
                    }
                  }}
                />

                <Button
                  className="w-full h-12 rounded-lg text-base"
                  icon={<UnlockIcon className="size-4" />}
                  disabled={password.trim().length === 0}
                  onClick={handleLogin}
                >
                  {TEXTS.lockScreen.button[language]}
                </Button>
              </div>
            </Card>
          </div>

          <div className="mb-8 text-center space-y-3">
            <div className="text-foreground/80 text-center text-xs flex items-center gap-4 dark:text-foreground/60">
              <p className="">Software Developed by CodeVille IT</p>

              <p>{`|`}</p>

              <p className="flex items-center gap-2">
                <PhoneIcon className="size-3" />
                Contact Support: +94 70 584 8028
              </p>
            </div>

            <p className="text-xs text-foreground/60 dark:text-foreground/40">
              © {new Date().getFullYear()} CodeVille IT. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
