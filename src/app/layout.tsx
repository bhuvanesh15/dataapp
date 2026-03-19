import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { DataProvider } from "@/context/DataContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { GlobalSearchProvider } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LayoutContent } from "@/components/layout/LayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Product Intelligent Dashboard",
  description: "Product intelligent dashboard for Amazon and eBay data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} scrollbar-glass relative min-h-screen`}>
        <ThemeProvider>
          <DataProvider>
            <SettingsProvider>
              <GlobalSearchProvider>
                <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
                  <Sidebar />
                  <div className="flex flex-1 flex-col min-w-0">
                    <LayoutContent>{children}</LayoutContent>
                  </div>
                </div>
              </GlobalSearchProvider>
            </SettingsProvider>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
