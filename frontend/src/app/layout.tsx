import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/constants";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${siteConfig.name} | ${siteConfig.title}`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-[var(--color-bg-primary)] bg-noise min-h-screen text-[var(--color-text-primary)] transition-colors duration-500">
        <ThemeProvider>
          <AuthProvider>
            <div className="relative z-10">
              {children}
            </div>
            {/* Global Mesh Background Layer */}
            <div className="fixed inset-0 bg-mesh pointer-events-none opacity-[0.4] contrast-[1.1]" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

