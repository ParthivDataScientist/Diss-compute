import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
