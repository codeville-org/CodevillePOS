import { createRoot } from "react-dom/client";

import { loadFonts } from "@/lib/fonts";
import { ThemeProvider } from "../components/providers/theme-provider";
import { LoadingWindow } from "./components/loading-window";

// Load fonts when the app starts
loadFonts()
  .then(() => {
    console.log("Fonts loaded successfully");
  })
  .catch((error) => {
    console.error("Failed to load fonts:", error);
  });

const root = createRoot(document.getElementById("loading-root")!);

root.render(
  <ThemeProvider defaultTheme="system">
    <LoadingWindow />
  </ThemeProvider>
);
