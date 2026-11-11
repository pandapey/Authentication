import { motion } from "framer-motion";
import { useState } from "react";
import { useForgotPasswordMutation } from "../slices/apiSlice";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../components/AuthLayout";
import { ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!emailRe.test(clean)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      const result = await forgotPassword(clean).unwrap();
      setIsSubmitted(true);
      if (result?.resetToken) setResetToken(result.resetToken);
      toast.success(`If an account exists, a reset link was sent to ${clean}`);
    } catch (err) {
      // 404 in dev means unknown email — surface it; prod is always generic
      if (err?.status === 404) {
        toast.error(err?.data?.message || "User not found.");
      } else {
        toast.error(err?.data?.message || "Failed to send reset link. Please try again.");
        setIsSubmitted(true);
      }
    }
  };

  return (
    <AuthLayout
      badge="Recovery"
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a secure reset link."
      footer={
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-cyan-300 transition-colors hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Login
        </Link>
      }
    >
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} noValidate>
          <Input
            icon={Mail}
            label="Email address"
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" isLoading={isLoading}>
            {!isLoading && <Send className="h-5 w-5" aria-hidden="true" />}
            {isLoading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      ) : (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-glow-cyan"
          >
            <CheckCircle2 className="h-8 w-8 text-ink-950" aria-hidden="true" />
          </motion.div>
          <h2 className="font-display text-lg font-bold text-white">Check your inbox</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
            If an account exists for <span className="font-semibold text-slate-200">{email}</span>, you will
            receive a password reset link shortly. It expires in 1 hour.
          </p>
          {resetToken && (
            <p className="mt-4 break-all rounded-xl border border-dashed border-white/15 bg-black/30 p-3 text-xs text-slate-400">
              Dev mode reset link:{" "}
              <Link to={`/reset-password/${resetToken}`} className="link-accent break-all">
                /reset-password/{resetToken}
              </Link>
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setResetToken(null);
            }}
            className="link-accent mt-4 text-sm"
          >
            Try a different email
          </button>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
