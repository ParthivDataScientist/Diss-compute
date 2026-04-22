"use client";

import Link from "next/link";
import { Laptop, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function InvitePage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    // Simulate auth request
    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-[420px]">
        <div className="mb-10 flex items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600 text-white shadow-sm">
            <Laptop size={20} />
          </span>
          <div>
            <span className="block text-[16px] font-bold tracking-tight text-ink">Circuit CRM</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-8 shadow-card sm:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold tracking-tight text-ink">Welcome to Circuit</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
              You&apos;ve been invited to join the <span className="font-semibold text-ink">Computer Shop</span> workspace. Set your password to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-status-red-50 p-3 text-[13px] font-medium text-status-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Set password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-line bg-gray-50 px-3 text-[14px] outline-none transition-colors focus:border-accent-500 focus:bg-white focus:ring-1 focus:ring-accent-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Confirm password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-line bg-gray-50 px-3 text-[14px] outline-none transition-colors focus:border-accent-500 focus:bg-white focus:ring-1 focus:ring-accent-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent-600 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-accent-700 active:bg-accent-800 disabled:opacity-70"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Join Workspace
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[12px] font-medium text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-ink transition-colors hover:text-accent-600">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
