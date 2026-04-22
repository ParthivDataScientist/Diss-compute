"use client";

import { useActionState } from "react";
import { Laptop, ArrowRight, Shield } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

const features = [
  "Private access — invitation only",
  "Role-based lead isolation",
  "Real-time pipeline tracking"
];

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-accent-50/40 p-12 lg:flex border-r border-line">
        <div className="absolute -left-1/4 -top-1/4 h-[700px] w-[700px] rounded-full bg-accent-100/60 blur-3xl" />
        <div className="absolute -bottom-1/4 right-0 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600 text-white shadow-sm">
            <Laptop size={20} />
          </span>
          <div>
            <span className="block text-[16px] font-bold tracking-tight text-ink">Circuit CRM</span>
            <span className="block text-[12px] font-medium text-muted">Computer Shop</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-accent-700">
            <Shield size={12} />
            Private access · Invitation only
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink leading-[1.1]">
            Your sales pipeline, under control.
          </h1>
          <p className="mt-5 text-[15px] font-medium leading-relaxed text-gray-600">
            A closed-access CRM built exclusively for the Circuit computer shop team. Access is provisioned by your administrator.
          </p>
          <ul className="mt-8 space-y-3">
            {features.map(f => (
              <li key={f} className="flex items-center gap-3 text-[14px] font-medium text-gray-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-white">
                  <ArrowRight size={11} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[12px] font-medium text-gray-400">
          © 2026 Circuit Software · Internal use only
        </p>
      </div>

      {/* Right form */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600 text-white shadow-sm">
              <Laptop size={20} />
            </span>
            <span className="text-[16px] font-bold text-ink">Circuit CRM</span>
          </div>

          <div className="rounded-2xl border border-line bg-white p-8 shadow-card">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-ink">Sign in to your workspace</h2>
              <p className="mt-2 text-[13px] text-gray-500">
                Enter the credentials provided by your administrator.
              </p>
            </div>

            <form action={formAction} className="space-y-5">
              {state?.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
                  {state.error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  className="h-10 w-full rounded-lg border border-line bg-gray-50 px-3 text-[14px] outline-none transition-colors focus:border-accent-500 focus:bg-white focus:ring-1 focus:ring-accent-500"
                  placeholder="you@circuit.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  className="h-10 w-full rounded-lg border border-line bg-gray-50 px-3 text-[14px] outline-none transition-colors focus:border-accent-500 focus:bg-white focus:ring-1 focus:ring-accent-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent-600 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-accent-700 disabled:opacity-70"
              >
                {isPending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>Sign In <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-[12px] font-medium text-gray-400">
            Access issues? Contact your administrator.
            <br />
            This is a private, closed-access system.
          </p>
        </div>
      </div>
    </div>
  );
}
