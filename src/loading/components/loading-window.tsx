import { useEffect, useState } from "react";

import loadingScreen from "@/assets/loading-screen.png";
import { Progress } from "../../components/ui/progress";
import { LoadingState } from "../loading-preload";

export function LoadingWindow() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    step: "Initializing...",
    progress: 0
  });

  useEffect(() => {
    // Listen for loading updates from main process
    const cleanup = window.loadingAPI?.onLoadingUpdate?.(
      (state: LoadingState) => {
        setLoadingState(state);
      }
    );

    // Start the initialization process
    window.loadingAPI?.startInitialization?.();

    return () => {
      cleanup?.();
      window.loadingAPI?.cleanup?.();
    };
  }, []);

  return (
    <div className="relative h-screen w-screen bg-background flex flex-col items-center justify-center">
      <img
        src={loadingScreen}
        alt="Codeville POS splash screen"
        className="w-full h-full object-cover"
      />

      <div className="absolute right-5 bottom-5 z-50 space-y-2">
        <div className="flex justify-between items-center gap-4 mb-1">
          <span className="text-sm font-medium text-foreground">
            {loadingState.step}
          </span>
          <span className="text-sm text-muted-foreground">
            {loadingState.progress}%
          </span>
        </div>

        {loadingState.details && (
          <p className="text-xs text-muted-foreground text-end">
            {loadingState.details}
          </p>
        )}
      </div>

      <div className="w-full">
        <Progress value={loadingState.progress} className="w-full h-1" />
      </div>
    </div>
  );
}
