import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "./context/ThemeContext";
import { CookieBanner } from "./components/ui/CookieBanner";
import { PrivacyModal } from "./components/ui/PrivacyModal";
import "./globals.css";

const fontDisplay = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

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
      className={`${fontDisplay.variable} ${fontMono.variable} h-full antialiased`}
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
