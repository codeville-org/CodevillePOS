import {
  AlertCircleIcon,
  KeyRoundIcon,
  MinusIcon,
  PhoneIcon,
  XIcon
} from "lucide-react";
import React, { useEffect, useState } from "react";

import appLogo from "@/assets/app-logo.png";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  getLicenseErrorMessage,
  LicenseErrorMessages
} from "@/lib/license/utils";

declare global {
  interface Window {
    activationAPI: import("../activation-preload").ActivationAPI;
  }
}

export function ActivationWindow() {
  const [serialKey, setSerialKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LicenseErrorMessages | null>(null);
  const [hardwareId, setHardwareId] = useState("");

  useEffect(() => {
    // Get hardware ID on component mount
    window.activationAPI?.license
      ?.getHardwareId?.()
      .then(setHardwareId)
      .catch(() => {
        setHardwareId("Unable to get Hardware ID");
      });
  }, []);

  const handleActivate = async () => {
    console.log({ hardwareId });

    if (!serialKey.trim()) {
      setError({
        title: "Serial Key is required !",
        description: "Please enter a valid serial key."
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.activationAPI?.license?.activate?.(
        serialKey.trim()
      );

      if (result?.success) {
        console.log("Activation successful");
        // The main process will handle closing this window and opening the main app
      } else {
        setError(
          getLicenseErrorMessage(result?.error) || {
            title: "Activation failed",
            description: "Please check your serial key and try again."
          }
        );
      }
    } catch (err) {
      setError({
        title: "Network error",
        description: "Please check your connection and try again."
      });
      console.error("Activation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    window.activationAPI?.window?.close?.();
  };

  const handleMinimize = () => {
    window.activationAPI?.window?.minimize?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleActivate();
    }
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col items-center">
      <div className="flex-1 w-full h-full p-1 pb-0 bg-secondary/40">
        <div className="flex flex-col flex-1 bg-background w-full h-full rounded-md">
          <div className="w-full flex justify-end p-2 drag-region">
            <div className="flex gap-1 no-drag">
              <Button
                variant="default"
                size="icon"
                className="size-6 bg-background rounded-full hover:bg-secondary/40 hover:text-secondary-foreground"
                onClick={handleMinimize}
              >
                <MinusIcon className="size-3" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="size-6 bg-background rounded-full hover:bg-red-500 hover:text-white"
                onClick={handleClose}
              >
                <XIcon className="size-3" />
              </Button>
            </div>
          </div>

          <div className="flex-1 w-full h-full flex flex-col items-center justify-center px-6 pb-6">
            <div className="w-60">
              <img
                src={appLogo}
                alt="Codeville POS App Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-9 text-center space-y-1">
              <h1 className="text-lg font-semibold">Activate License</h1>
              <p className="text-xs text-foreground/50">
                {`Enter your serial key to activate CodeVille POS.`}
              </p>
            </div>

            <div className="mt-3 w-full rounded-md overflow-hidden max-w-80 border border-secondary/60 flex flex-row items-center justify-center">
              <div className="size-11 bg-secondary/60 flex items-center justify-center">
                <KeyRoundIcon className="size-4 fill-secondary-foreground/50" />
              </div>
              <input
                className="flex-1 w-full text-center tracking-widest bg-background/0 placeholder:opacity-50 focus:outline-none focus:ring-0 focus:border-0"
                placeholder="XXXX XXXX XXXX XXXX"
                id="serialKey"
                type="text"
                value={serialKey}
                onChange={(e) => setSerialKey(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <Button
              className="w-full h-11 max-w-80 bg-gradient-to-t from-green-950 to-green-700 text-green-50 hover:from-green-900 hover:to-green-600 transition-all ease-in-out duration-100 mt-3"
              onClick={handleActivate}
              disabled={isLoading}
              loading={isLoading}
            >
              Activate
            </Button>
          </div>

          {error && (
            <div className="py-2 px-4 w-full">
              <Alert
                variant="destructive"
                className="bg-destructive/5 border border-destructive"
              >
                <AlertCircleIcon className="text-red-500 stroke-red-500" />
                <AlertTitle className="text-red-500">{error.title}</AlertTitle>
                {error.description && (
                  <AlertDescription className="text-xs text-red-700">
                    {error.description}
                  </AlertDescription>
                )}
              </Alert>
            </div>
          )}
        </div>
      </div>

      <div className="h-12 w-full bg-secondary/40 flex items-center justify-center px-4">
        <div className="text-xs text-secondary-foreground/70 flex items-center gap-2">
          <PhoneIcon className="size-3" />
          {`Need Help ? `}{" "}
          <span className="font-light">{`Contact: +94 70 584 8028`}</span>
        </div>
      </div>
    </div>
  );
}
