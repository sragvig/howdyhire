import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StudioStepper } from "@/components/studio/StudioStepper";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

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
  description: "Aggie-friendly AI Interview Practice",
  // Tab icons are pre-cropped circular PNGs (`npm run icons` regenerates them from
  // public/reveille-jr.png); browsers can't clip favicons with CSS. Page mascots still use the
  // full-res reveille-jr.png. Bump ?v= whenever the icons are regenerated to bust favicon caches.
  icons: {
    icon: [
      { url: "/icons/reveille-circle-32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/icons/reveille-circle-192.png?v=3", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/reveille-circle-32.png?v=3",
    // Opaque cream background: iOS renders transparent touch-icon pixels as black.
    apple: [{ url: "/icons/reveille-apple-180.png?v=3", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the init script sets data-theme on <html> before React hydrates.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Plain inline script (not next/script) so it runs before first paint; React doesn't
            execute or reconcile its contents on the client, so skip the hydration comparison. */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
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
