"use client";

import React, { useState, useRef } from "react";
import {
  useLoginMutation,
  useLazyGetProfileQuery,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "@/redux/api/adminApi";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/features/authSlice";
import { getErrorMessage } from "@/redux";
import {
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";

type AuthMode = "login" | "forgot_email" | "forgot_otp" | "forgot_password";

export default function AuthForms() {
  const dispatch = useAppDispatch();
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot password flow state
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status alerts
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // RTK Query Hooks
  const [loginApi, { isLoading: isLoggingIn }] = useLoginMutation();
  const [fetchProfile] = useLazyGetProfileQuery();
  const [forgotPasswordApi, { isLoading: isSendingOtp }] =
    useForgotPasswordMutation();
  const [verifyOtpApi, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const [resetPasswordApi, { isLoading: isResettingPassword }] =
    useResetPasswordMutation();

  // Reset alert messages on mode switch
  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (mode !== "forgot_otp") {
      setOtpDigits(["", "", "", "", "", ""]);
    }
  };

  // OTP Digits Handlers
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    // Pasted or entered multiple digits
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      pasted.forEach((char, idx) => {
        if (index + idx < 6) {
          newDigits[index + idx] = char;
        }
      });
      setOtpDigits(newDigits);
      setErrorMessage(null);
      const nextFocus = Math.min(index + pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    // Single digit
    const newDigits = [...otpDigits];
    newDigits[index] = clean;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = "";
        setOtpDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      const newDigits = ["", "", "", "", "", ""];
      pasted.split("").forEach((char, idx) => {
        newDigits[idx] = char;
      });
      setOtpDigits(newDigits);
      setErrorMessage(null);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage("Please enter both work email and password.");
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
      setErrorMessage(
        getErrorMessage(
          err,
          "Invalid email or password. Please verify your credentials.",
        ),
      );
    }
  };

  // Step 1: Send OTP for Forgot Password
  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotEmail.trim()) {
      setErrorMessage("Please enter your admin email address.");
      return;
    }

    try {
      await forgotPasswordApi({
        Email: forgotEmail.trim(),
      }).unwrap();

      setOtpDigits(["", "", "", "", "", ""]);
      setErrorMessage(null);
      setSuccessMessage(null);
      setAuthMode("forgot_otp");
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err: unknown) {
      setErrorMessage(
        getErrorMessage(
          err,
          "Failed to send OTP code. Please check your email address.",
        ),
      );
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!forgotEmail.trim() || isSendingOtp) return;
    setErrorMessage(null);

    try {
      const res = await forgotPasswordApi({
        Email: forgotEmail.trim(),
      }).unwrap();
      setSuccessMessage(
        res.Message || "A new 6-digit code has been sent to your email.",
      );
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err: unknown) {
      setErrorMessage(
        getErrorMessage(err, "Failed to resend code. Please try again later."),
      );
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const otpCode = otpDigits.join("");
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    try {
      const res = await verifyOtpApi({
        Email: forgotEmail.trim(),
        Otp: otpCode,
      }).unwrap();

      const token = res.Data?.ResetToken;
      if (!token) {
        setErrorMessage("Verification succeeded, but no reset token was returned.");
        return;
      }

      setResetToken(token);
      setSuccessMessage(null);
      setErrorMessage(null);
      setNewPassword("");
      setConfirmPassword("");
      setAuthMode("forgot_password");
    } catch (err: unknown) {
      setErrorMessage(
        getErrorMessage(
          err,
          "Invalid or expired OTP code. Please verify the code and try again.",
        ),
      );
    }
  };

  // Step 3: Reset Password with Token
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword) {
      setErrorMessage("Please enter your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please ensure both fields match.");
      return;
    }

    try {
      const res = await resetPasswordApi({
        ResetToken: resetToken,
        NewPassword: newPassword,
      }).unwrap();

      // Successful reset: transition back to login pre-filled with the reset email
      setLoginEmail(forgotEmail);
      setLoginPassword("");
      setSuccessMessage(
        res.Message || "Password reset successfully! Please sign in with your new password.",
      );
      setErrorMessage(null);
      setAuthMode("login");
    } catch (err: unknown) {
      setErrorMessage(
        getErrorMessage(
          err,
          "Failed to reset password. The session may have expired. Please restart the flow.",
        ),
      );
    }
  };

  const isOtpComplete = otpDigits.join("").length === 6;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Auth Card with Fixed Min-Height to Keep Height Identical Across All Views */}
      <div className="min-h-[550px] sm:min-h-[570px] flex flex-col justify-between rounded-2xl border border-slate-200 bg-white px-8 sm:px-10 pt-10 pb-12 sm:pt-12 sm:pb-14 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#121215]">
        <div>
          {/* Brand Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-md shadow-slate-200/50 border border-slate-200/80 dark:bg-[#161619] dark:border-slate-800">
              <img
                src="/bbc-logo.png"
                alt="Solanki Hospital Logo"
                className="h-full w-full object-contain"
              />
            </div>

            {authMode === "login" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Solanki Hospital Admin
                </h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Secure access to hospital administration &amp; medical operations
                </p>
              </>
            )}

            {authMode === "forgot_email" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Forgot Password
                </h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Enter your admin email to receive a verification OTP code
                </p>
              </>
            )}

            {authMode === "forgot_otp" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Verify OTP Code
                </h2>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  Enter the 6-digit verification code sent to
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/70 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-[#18181b] dark:text-slate-200">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span>{forgotEmail}</span>
                </div>
              </>
            )}

            {authMode === "forgot_password" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Set New Password
                </h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Create and confirm a strong password for your admin account
                </p>
              </>
            )}
          </div>

          {/* Step Indicator for Forgot Password Flow */}
          {authMode !== "login" && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  authMode === "forgot_email"
                    ? "w-8 bg-blue-600 dark:bg-blue-500"
                    : "w-2 bg-slate-200 dark:bg-slate-700"
                }`}
              />
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  authMode === "forgot_otp"
                    ? "w-8 bg-blue-600 dark:bg-blue-500"
                    : "w-2 bg-slate-200 dark:bg-slate-700"
                }`}
              />
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  authMode === "forgot_password"
                    ? "w-8 bg-blue-600 dark:bg-blue-500"
                    : "w-2 bg-slate-200 dark:bg-slate-700"
                }`}
              />
            </div>
          )}

          {/* Status Messages */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200/80 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-[#161619] px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium leading-relaxed">{successMessage}</span>
            </div>
          )}
        </div>

        {/* 1. SIGN IN FORM */}
        {authMode === "login" && (
          <form
            onSubmit={handleLoginSubmit}
            className="flex-1 flex flex-col justify-between pt-2"
          >
            <div className="space-y-5">
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

              {/* Password Field with Forgot Password Link */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (loginEmail.trim()) {
                        setForgotEmail(loginEmail.trim());
                      }
                      switchMode("forgot_email");
                    }}
                    className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:underline cursor-pointer transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    tabIndex={-1}
                    aria-label={
                      showLoginPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-6">
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
        )}

        {/* 2. FORGOT PASSWORD - REQUEST OTP */}
        {authMode === "forgot_email" && (
          <form
            onSubmit={handleForgotEmailSubmit}
            className="flex-1 flex flex-col justify-between pt-2"
          >
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Email"
                    required
                    autoFocus
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <button
                type="submit"
                disabled={isSendingOtp}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => switchMode("login")}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 py-1 transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. VERIFY OTP (6-Digit Segmented Pin Input) */}
        {authMode === "forgot_otp" && (
          <form
            onSubmit={handleVerifyOtpSubmit}
            className="flex-1 flex flex-col justify-between pt-2"
          >
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3 px-0.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Security Code
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    6 digits
                  </span>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <React.Fragment key={idx}>
                      <input
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        autoFocus={idx === 0}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        onPaste={handlePaste}
                        onFocus={(e) => e.target.select()}
                        className={`h-12 w-11 sm:h-13 sm:w-12 rounded-xl text-center text-lg font-bold font-mono transition-all duration-150 outline-none ${
                          digit
                            ? "border-slate-900 bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/10 dark:border-slate-100 dark:bg-[#18181b] dark:text-slate-100 dark:ring-slate-100/10"
                            : "border-slate-200 bg-slate-50/70 text-slate-900 hover:border-slate-300 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:hover:border-slate-700"
                        } focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/15 dark:focus:border-slate-100 dark:focus:bg-[#18181b] dark:focus:ring-slate-100/15`}
                      />
                      {idx === 2 && (
                        <span className="text-slate-300 dark:text-slate-700 font-bold select-none text-sm px-0.5">
                          —
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Resend OTP Row */}
                <div className="mt-4 flex items-center justify-between px-1 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">
                    Didn&apos;t receive code?
                  </span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSendingOtp}
                    className="font-semibold text-slate-900 hover:text-black dark:text-slate-100 dark:hover:text-white underline underline-offset-4 cursor-pointer disabled:opacity-50 transition"
                  >
                    {isSendingOtp ? "Resending..." : "Resend OTP"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <button
                type="submit"
                disabled={isVerifyingOtp || !isOtpComplete}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-40 cursor-pointer"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => switchMode("forgot_email")}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 py-1 transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change Email</span>
              </button>
            </div>
          </form>
        )}

        {/* 4. SET NEW PASSWORD */}
        {authMode === "forgot_password" && (
          <form
            onSubmit={handleResetPasswordSubmit}
            className="flex-1 flex flex-col justify-between pt-2"
          >
            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    required
                    autoFocus
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <button
                type="submit"
                disabled={isResettingPassword}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => switchMode("login")}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 py-1 transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Cancel &amp; Back to Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
