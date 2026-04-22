"use client";

import Link from "next/link";
import { Laptop, ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
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
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-status-green-50 text-status-green-600">
                <Mail size={24} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-ink">Check your email</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-gray-500">
                We&apos;ve sent a password reset link to <span className="font-semibold text-ink">{email}</span>. Please check your inbox.
              </p>
              <Link
                href="/login"
                className="mt-8 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line bg-white text-[14px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-xl font-bold tracking-tight text-ink">Reset your password</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
                  Enter the email address associated with your account, and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-lg border border-line bg-gray-50 px-3 text-[14px] outline-none transition-colors focus:border-accent-500 focus:bg-white focus:ring-1 focus:ring-accent-500"
                    placeholder="name@company.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent-600 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-accent-700 active:bg-accent-800 disabled:opacity-70"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="mt-6 flex justify-center">
                <Link href="/login" className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 transition-colors hover:text-ink">
                  <ArrowLeft size={14} />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
