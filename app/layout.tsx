import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Circuit CRM",
  description: "A closed-access CRM for computer shop lead management."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-ink bg-surface selection:bg-accent-100 selection:text-accent-700">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
