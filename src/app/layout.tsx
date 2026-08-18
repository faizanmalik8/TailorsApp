import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/components/AuthProvider";
import { SyncProvider } from "@/components/SyncProvider";
import { InstallPrompt } from "@/components/InstallPrompt";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "B Tailor",
  description: "Manage your tailor shop customers, orders, and billing.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BT",
  },
};

export const viewport: Viewport = {
  themeColor: "#152A4A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
      <body 
        className="min-h-screen bg-gray-50 text-gray-900 pb-24"
        suppressHydrationWarning
      >
        <AuthProvider>
          <SyncProvider>
            <div className="flex flex-col min-h-screen pb-20">
              <Header />
              <main className="flex-1 w-full max-w-md mx-auto relative pt-14">
                {children}
              </main>
              <InstallPrompt />
              <BottomNav />
            </div>
          </SyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
