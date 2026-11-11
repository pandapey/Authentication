import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from "../slices/apiSlice";
import { setUser, setAuthenticated } from "../slices/authSlice";
import { toast } from "react-hot-toast";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";

const RESEND_COOLDOWN = 60;

const formatCooldown = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendCode, { isLoading: isResending }] = useResendVerificationMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  // Codes already rejected by the server — resubmitting the identical code
  // would burn another attempt, so it is skipped (a fresh code needs resend).
  const lastTriedRef = useRef("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index, value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 1) {
      const newCode = [...code];
      for (let i = 0; i < digits.length && index + i < 6; i++) {
        newCode[index + i] = digits[i];
      }
      setCode(newCode);
      const focusIndex = Math.min(index + digits.length, 5);
      inputRefs.current[focusIndex]?.focus();
    } else if (digits.length === 1) {
      const newCode = [...code];
      newCode[index] = digits;
      setCode(newCode);
      if (index < 5) inputRefs.current[index + 1]?.focus();
    } else if (value === "") {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length !== 6 || isLoading || isSubmitting) return;
    // Don't burn an attempt re-sending a code the server already rejected
    if (verificationCode === lastTriedRef.current) return;
    lastTriedRef.current = verificationCode;
    setIsSubmitting(true);
    try {
      const result = await verifyEmail({
        code: verificationCode,
        email: user?.email,
      }).unwrap();
      if (result.success) {
        if (result.user) {
          dispatch(setUser(result.user));
          dispatch(setAuthenticated(true));
        }
        toast.success("Account created successfully! Welcome aboard!");
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const msg = err?.data?.message || "Email verification failed.";
      const left = err?.data?.attemptsLeft;
      if (typeof left === "number") setAttemptsLeft(left);
      else if (/too many/i.test(msg)) setAttemptsLeft(0);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    if (!user?.email) {
      toast.error("No account email found. Please sign up again.");
      navigate("/signup");
      return;
    }
    try {
      await resendCode(user.email).unwrap();
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setCooldown(RESEND_COOLDOWN);
      setAttemptsLeft(null);
      lastTriedRef.current = "";
      // OTP goes to the inbox only — never shown on screen.
      toast.success("New verification code sent to your email.");
    } catch (err) {
      const retry = err?.data?.retryAfter;
      if (retry) setCooldown(retry);
      toast.error(err?.data?.message || "Failed to resend code.");
    }
  };

  useEffect(() => {
    if (code.every((digit) => digit !== "") && !isLoading && !isSubmitting) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const complete = code.filter(Boolean).length;
  const busy = isLoading || isSubmitting;

  return (
    <AuthLayout
      badge="Check your inbox"
      title="Verify your email"
      subtitle={
        user?.email
          ? `Enter the 6-digit code sent to ${user.email}. It expires in 5 minutes.`
          : "Enter the 6-digit code sent to your email address."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex justify-between gap-2" role="group" aria-label="6-digit verification code">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label={`Digit ${index + 1}`}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-12 w-12 rounded-xl border border-white/10 bg-ink-900/80 text-center text-xl font-bold text-white transition-all focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 sm:h-14 sm:w-12"
              />
            ))}
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300 transition-all duration-300"
              style={{ width: `${(complete / 6) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-slate-500" aria-live="polite">
            {attemptsLeft === 0
              ? "Code locked — request a new one below"
              : attemptsLeft !== null
                ? `${attemptsLeft} of 5 attempts remaining`
                : complete === 6
                  ? "Verifying…"
                  : `${complete} of 6 digits entered`}
          </p>
        </div>

        <Button type="submit" isLoading={busy}>
          {!busy && <ShieldCheck className="h-5 w-5" aria-hidden="true" />}
          {busy ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <div className="mt-5 rounded-2xl border border-white/5 bg-black/25 p-4 text-center">
        <p className="text-sm text-slate-400">
          Didn&apos;t receive the code?{" "}
          {cooldown > 0 ? (
            <span className="font-semibold text-slate-500">Resend in {formatCooldown(cooldown)}</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="link-accent inline-flex items-center gap-1.5 font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} aria-hidden="true" />
              {isResending ? "Sending…" : "Resend code"}
            </button>
          )}
        </p>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <MailCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {attemptsLeft === 0
            ? "Too many wrong guesses — resend to get a fresh code."
            : "Each code allows 5 wrong guesses — repeating the same code won't cost extra."}
        </p>
      </div>
    </AuthLayout>
  );
};

export default EmailVerificationPage;
