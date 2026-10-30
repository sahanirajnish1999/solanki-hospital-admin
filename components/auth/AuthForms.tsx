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

type AuthStep = "login" | "forgot_email" | "forgot_otp" | "forgot_password";

const INPUT_CLS =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:placeholder:text-slate-500";

const LABEL_CLS =
  "block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2";

export default function AuthForms() {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<AuthStep>("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // RTK Query hooks
  const [loginApi, { isLoading: isLoggingIn }] = useLoginMutation();
  const [fetchProfile] = useLazyGetProfileQuery();
  const [forgotPasswordApi, { isLoading: isSendingOtp }] =
    useForgotPasswordMutation();
  const [verifyOtpApi, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const [resetPasswordApi, { isLoading: isResettingPassword }] =
    useResetPasswordMutation();

  const isLoading =
    isLoggingIn || isSendingOtp || isVerifyingOtp || isResettingPassword;

  // Step change helper
  const goTo = (target: AuthStep) => {
    setError(null);
    setSuccess(null);
    setStep(target);
    if (target === "forgot_otp") {
      setOtpDigits(Array(6).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  // OTP handlers
  const handleOtpInput = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }
    const digits = clean.slice(0, 6).split("");
    setOtpDigits((prev) => {
      const next = [...prev];
      digits.forEach((d, i) => {
        if (index + i < 6) next[index + i] = d;
      });
      return next;
    });
    setError(null);
    inputRefs.current[Math.min(index + digits.length, 5)]?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const clean = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!clean) return;
    const next = Array(6).fill("");
    clean.split("").forEach((c, i) => {
      next[i] = c;
    });
    setOtpDigits(next);
    setError(null);
    inputRefs.current[Math.min(clean.length, 5)]?.focus();
  };

  // Submit handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Sign In
    if (step === "login") {
      if (!email.trim() || !password) {
        setError("Please enter both work email and password.");
        return;
      }
      try {
        const res = await loginApi({
          Email: email.trim(),
          Password: password,
        }).unwrap();
        if (res.Data?.Token) {
          const profile = await fetchProfile().unwrap();
          if (profile.Data) {
            dispatch(
              setCredentials({ token: res.Data.Token, admin: profile.Data }),
            );
          }
        }
      } catch (err: unknown) {
        setError(
          getErrorMessage(
            err,
            "Invalid email or password. Please verify your credentials.",
          ),
        );
      }
      return;
    }

    // 2. Request OTP
    if (step === "forgot_email") {
      if (!email.trim()) {
        setError("Please enter your admin email address.");
        return;
      }
      try {
        await forgotPasswordApi({ Email: email.trim() }).unwrap();
        goTo("forgot_otp");
      } catch (err: unknown) {
        setError(
          getErrorMessage(
            err,
            "Failed to send verification code. Please check your email.",
          ),
        );
      }
      return;
    }

    // 3. Verify OTP
    if (step === "forgot_otp") {
      const otp = otpDigits.join("");
      if (otp.length < 6) {
        setError("Please enter all 6 digits of the verification code.");
        return;
      }
      try {
        const res = await verifyOtpApi({
          Email: email.trim(),
          Otp: otp,
        }).unwrap();
        if (res.Data?.ResetToken) {
          setResetToken(res.Data.ResetToken);
          goTo("forgot_password");
        } else {
          setError("Verification succeeded, but no reset token was returned.");
        }
      } catch (err: unknown) {
        setError(
          getErrorMessage(
            err,
            "Invalid or expired OTP code. Please check and try again.",
          ),
        );
      }
      return;
    }

    // 4. Set New Password
    if (step === "forgot_password") {
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match. Please ensure both fields match.");
        return;
      }
      try {
        await resetPasswordApi({
          ResetToken: resetToken,
          NewPassword: newPassword,
        }).unwrap();
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setStep("login");
        setSuccess(
          "Password reset successfully! Please sign in with your new password.",
        );
      } catch (err: unknown) {
        setError(
          getErrorMessage(
            err,
            "Failed to reset password. The session may have expired.",
          ),
        );
      }
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim() || isSendingOtp) return;
    setError(null);
    try {
      const res = await forgotPasswordApi({ Email: email.trim() }).unwrap();
      setSuccess(
        res.Message || "A new 6-digit code has been sent to your email.",
      );
      setOtpDigits(Array(6).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Failed to resend code. Please try again later."),
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="min-h-[550px] sm:min-h-[570px] flex flex-col justify-between rounded-2xl border border-slate-200 bg-white px-8 sm:px-10 pt-10 pb-12 sm:pt-12 sm:pb-14 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#121215]">
        {/* Header & Logo */}
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-md shadow-slate-200/50 border border-slate-200/80 dark:bg-[#161619] dark:border-slate-800">
            <img
              src="/bbc-logo.png"
              alt="Solanki Hospital Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mb-7 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {step === "login" && "Solanki Hospital Admin"}
              {step === "forgot_email" && "Forgot Password"}
              {step === "forgot_otp" && "Verify OTP Code"}
              {step === "forgot_password" && "Set New Password"}
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {step === "login" &&
                "Secure access to hospital administration & medical operations"}
              {step === "forgot_email" &&
                "Enter your admin email to receive a verification OTP code"}
              {step === "forgot_otp" &&
                "Enter the 6-digit verification code sent to"}
              {step === "forgot_password" &&
                "Create and confirm a strong password for your admin account"}
            </p>

            {step === "forgot_otp" && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/70 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-[#18181b] dark:text-slate-200">
                <Mail className="h-3 w-3 text-slate-400" />
                <span>{email}</span>
              </div>
            )}
          </div>

          {/* Stepper Progress Indicator for Forgot Password flow */}
          {step !== "login" && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {(["forgot_email", "forgot_otp", "forgot_password"] as const).map(
                (s) => (
                  <div
                    key={s}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      step === s
                        ? "w-8 bg-blue-600 dark:bg-blue-500"
                        : "w-2 bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                ),
              )}
            </div>
          )}

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200/80 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-[#161619] px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium leading-relaxed">{success}</span>
            </div>
          )}
        </div>

        {/* Dynamic Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col justify-between pt-2"
        >
          {/* Step 1: Login */}
          {step === "login" && (
            <div className="space-y-5">
              <div>
                <label className={LABEL_CLS}>Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    autoComplete="email"
                    className={INPUT_CLS}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => goTo("forgot_email")}
                    className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:underline cursor-pointer transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                    className={INPUT_CLS}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
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
            </div>
          )}

          {/* Step 2: Request OTP */}
          {step === "forgot_email" && (
            <div className="space-y-5">
              <div>
                <label className={LABEL_CLS}>Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    autoFocus
                    autoComplete="email"
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verify OTP */}
          {step === "forgot_otp" && (
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

                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <React.Fragment key={idx}>
                      <input
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        autoFocus={idx === 0}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
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
          )}

          {/* Step 4: Reset Password */}
          {step === "forgot_password" && (
            <div className="space-y-4">
              <div>
                <label className={LABEL_CLS}>New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    required
                    autoComplete="new-password"
                    className={INPUT_CLS}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
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

              <div>
                <label className={LABEL_CLS}>Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    autoComplete="new-password"
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions (Submit & Secondary Nav) */}
          <div className="pt-6 space-y-3">
            <button
              type="submit"
              disabled={
                isLoading ||
                (step === "forgot_otp" && otpDigits.join("").length < 6)
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {step === "login" && "Authenticating Admin..."}
                    {step === "forgot_email" && "Sending Verification Code..."}
                    {step === "forgot_otp" && "Verifying Code..."}
                    {step === "forgot_password" && "Resetting Password..."}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {step === "login" && "Sign In"}
                    {step === "forgot_email" && "Send Verification Code"}
                    {step === "forgot_otp" && "Verify Code"}
                    {step === "forgot_password" && "Reset Password"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {step !== "login" && (
              <button
                type="button"
                onClick={() => {
                  if (step === "forgot_otp") {
                    goTo("forgot_email");
                  } else {
                    goTo("login");
                  }
                }}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 py-1 transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>
                  {step === "forgot_email" && "Back to Sign In"}
                  {step === "forgot_otp" && "Change Email"}
                  {step === "forgot_password" && "Cancel & Back to Sign In"}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
