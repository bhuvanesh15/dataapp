import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { DataProvider } from "@/context/DataContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { GlobalSearchProvider } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LayoutContent } from "@/components/layout/LayoutContent";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: SITE.documentTitle,
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className={`${GeistSans.className} scrollbar-glass relative min-h-screen`}>
        <ThemeProvider>
          <DataProvider>
            <SettingsProvider>
              <GlobalSearchProvider>
                <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
                  <Sidebar />
                  <div className="flex min-w-0 flex-1 flex-col">
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
