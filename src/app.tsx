import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

import { loadFonts } from "@/lib/fonts";
import { AuthLayout } from "./components/layouts/auth-layout";
import { Wrapper } from "./components/layouts/wrapper";
import { QueryProvider } from "./components/providers/query-provider";
import { ThemeProvider } from "./components/providers/theme-provider";
import { Toaster } from "./components/ui/sonner";

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
  <ThemeProvider defaultTheme="system">
    <NuqsAdapter>
      <QueryProvider>
        <AuthLayout>
          <MemoryRouter initialEntries={["/"]} initialIndex={0}>
            <Wrapper />
          </MemoryRouter>
        </AuthLayout>

        <Toaster position="bottom-center" />
      </QueryProvider>
    </NuqsAdapter>
  </ThemeProvider>
);
