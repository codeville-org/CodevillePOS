import { useEffect, useState } from "react";
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
    <div className="h-screen w-screen bg-background flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-8 max-w-md w-full px-8">
        {/* App Logo */}
        <div className="w-24 h-24 mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">
              CV
            </span>
          </div>
        </div>

        {/* App Name */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">CodeVille POS</h1>
          <p className="text-sm text-muted-foreground">Point of Sale System</p>
        </div>

        {/* Loading Progress */}
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                {loadingState.step}
              </span>
              <span className="text-sm text-muted-foreground">
                {loadingState.progress}%
              </span>
            </div>
            <Progress value={loadingState.progress} className="w-full h-2" />
          </div>

          {loadingState.details && (
            <p className="text-xs text-muted-foreground text-center">
              {loadingState.details}
            </p>
          )}
        </div>

        {/* Loading Animation */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.6s"
              }}
            />
          ))}
        </div>

        {/* Version Info */}
        <div className="text-xs text-muted-foreground">Version 1.0.0</div>
      </div>
    </div>
  );
}
