"use client";

import React, { useState } from "react";
import {
  useLoginMutation,
  useSignupMutation,
  useLazyGetProfileQuery,
} from "@/redux/api/adminApi";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/features/authSlice";
import { getErrorMessage } from "@/redux";
import type { AdminRole } from "@/redux/types/admin.types";
import {
  Lock,
  Mail,
  User,
  Phone,
  Shield,
  Upload,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Hospital,
} from "lucide-react";

export default function AuthForms() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupRole, setSignupRole] = useState<AdminRole>("admin");
  const [signupImageBase64, setSignupImageBase64] = useState<string>("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  // RTK Query Hooks
  const [loginApi, { isLoading: isLoggingIn }] = useLoginMutation();
  const [signupApi, { isLoading: isSigningUp }] = useSignupMutation();
  const [fetchProfile] = useLazyGetProfileQuery();

  // Handle Image Upload for Signup
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSignupError("Profile image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignupImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Please enter both email and password.");
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
            })
          );
        }
      }
    } catch (err: unknown) {
      setLoginError(
        getErrorMessage(
          err,
          "Login failed. Please verify your credentials."
        )
      );
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupSuccess(null);

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setSignupError("Name, Email, and Password are required fields.");
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await signupApi({
        Name: signupName.trim(),
        Email: signupEmail.trim(),
        Password: signupPassword,
        Phone: signupPhone.trim() || undefined,
        Role: signupRole,
        ProfileImage: signupImageBase64 || undefined,
      }).unwrap();

      setSignupSuccess(
        response.Message || "Admin account registered successfully!"
      );

      if (response.Data?.Token) {
        dispatch(
          setCredentials({
            token: response.Data.Token,
            admin: response.Data.Admin,
          })
        );
      } else {
        setTimeout(() => {
          setTab("login");
          setLoginEmail(signupEmail.trim());
        }, 1500);
      }
    } catch (err: unknown) {
      setSignupError(
        getErrorMessage(err, "Signup failed. Please try again.")
      );
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Pure White Container Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25">
            <Hospital className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Solanki Hospital Admin
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Secure access to hospital administration & medical operations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              tab === "login"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Admin Login
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              tab === "signup"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Register Admin
          </button>
        </div>

        {/* Tab 1: Login Form */}
        {tab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@solankihospital.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Signup Form */}
        {tab === "signup" && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {signupError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <span>{signupError}</span>
              </div>
            )}

            {signupSuccess && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                <span>{signupSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Dr. Rajnish Sahani"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="doctor@solankihospital.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password (min 6) *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Assigned Role
                </label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as AdminRole)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  First admin registered is auto-promoted to superadmin.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Profile Photo (Optional)
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2.5 px-3 text-xs font-medium text-slate-600 transition hover:border-blue-500 hover:bg-blue-50/30">
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span className="truncate">
                    {signupImageBase64 ? "Photo selected" : "Choose image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {signupImageBase64 && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <img
                      src={signupImageBase64}
                      alt="Preview"
                      className="h-6 w-6 rounded-full object-cover ring-1 ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setSignupImageBase64("")}
                      className="text-[11px] text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSigningUp}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50"
            >
              {isSigningUp ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register Admin Account</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
