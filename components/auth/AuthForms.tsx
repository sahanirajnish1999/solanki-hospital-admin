"use client";

import React, { useState } from "react";
import { useLoginMutation, useLazyGetProfileQuery } from "@/redux/api/adminApi";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/features/authSlice";
import { getErrorMessage } from "@/redux";
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function AuthForms() {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // RTK Query Hooks
  const [loginApi, { isLoading: isLoggingIn }] = useLoginMutation();
  const [fetchProfile] = useLazyGetProfileQuery();

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Please enter both work email and password.");
      return;
    }

    try {
      const response = await loginApi({
        Email: loginEmail.trim(),
        Password: loginPassword,
      }).unwrap();

      if (response.Data?.Token) {
        const profileRes = await fetchProfile().unwrap();
        if (profileRes.Data) {
          dispatch(
            setCredentials({
              token: response.Data.Token,
              admin: profileRes.Data,
            }),
          );
        }
      }
    } catch (err: unknown) {
      setLoginError(
        getErrorMessage(
          err,
          "Invalid email or password. Please verify your credentials.",
        ),
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Login Card with Generous Top & Bottom Spacing */}
      <div className="rounded-2xl border border-slate-200 bg-white px-8 sm:px-10 pt-12 pb-14 sm:pt-14 sm:pb-16 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#121215]">
        {/* Brand Header */}
        <div className="mb-9 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-md shadow-slate-200/50 border border-slate-200/80 dark:bg-[#161619] dark:border-slate-800">
            <img
              src="/bbc-logo.png"
              alt="Solanki Hospital Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Solanki Hospital Admin
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Secure access to hospital administration &amp; medical operations
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          {/* Error Alert */}
          {loginError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span className="font-medium leading-relaxed">{loginError}</span>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 sm:pt-5">
            <button
              type="submit"
              disabled={isLoggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
