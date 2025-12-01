import { createRoot } from "react-dom/client";

import { loadFonts } from "@/lib/fonts";
import { ThemeProvider } from "../components/providers/theme-provider";
import { Toaster } from "../components/ui/sonner";
import { ActivationWindow } from "./components/activation-window";

// Load fonts when the app starts
loadFonts()
  .then(() => {
    console.log("Fonts loaded successfully");
  })
  .catch((error) => {
    console.error("Failed to load fonts:", error);
  });

const root = createRoot(document.body);

root.render(
  <ThemeProvider defaultTheme="dark">
    <ActivationWindow />
    <Toaster position="bottom-center" />
  </ThemeProvider>
);
