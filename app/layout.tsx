import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Circuit CRM",
  description: "A closed-access CRM for computer shop lead management."
};

const themeScript = `
(() => {
  try {
    const key = "circuit_crm_theme";
    const stored = localStorage.getItem(key);
    const theme = stored === "dark" || stored === "light"
      ? stored
      : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased text-ink bg-surface selection:bg-accent-100 selection:text-accent-700">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
