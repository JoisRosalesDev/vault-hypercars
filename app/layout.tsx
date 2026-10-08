import type { Metadata } from "next";
import { ThemeProvider } from "./context/ThemeContext";
import { CookieBanner } from "./components/ui/CookieBanner";
import { PrivacyModal } from "./components/ui/PrivacyModal";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vault Hypercars",
  description: "E-commerce de autos de lujo",
};

const themeInitScript = `
  (function() {
    try {
      var saved = localStorage.getItem('vault_telemetry_theme');
      var theme = (saved === 'corsa' || saved === 'cyan') ? saved : 'cyan';
      document.documentElement.setAttribute('data-theme', theme);
    } catch(e) {
      document.documentElement.setAttribute('data-theme', 'cyan');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 font-display">
        <ThemeProvider>
          {children}
          <CookieBanner />
          <PrivacyModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
