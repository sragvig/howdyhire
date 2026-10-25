import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StudioStepper } from "@/components/studio/StudioStepper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face for headings and big numbers.
const display = Plus_Jakarta_Sans({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HowdyHire",
  description: "Behavioral interview studio for Aggies",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <ToastProvider>
          <SessionProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex min-w-0 flex-1 flex-col">
                <Header />
                <main className="flex-1 px-4 py-8 sm:px-8 print:p-0">
                  {/* usePathname is runtime data under cacheComponents */}
                  <Suspense fallback={null}>
                    <StudioStepper />
                  </Suspense>
                  {children}
                </main>
              </div>
            </div>
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
