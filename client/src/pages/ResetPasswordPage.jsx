import { useState } from "react";
import { useResetPasswordMutation } from "../slices/apiSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../components/AuthLayout";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setFormError("This reset link is invalid. Please request a new one.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      toast.error("Passwords do not match");
      return;
    }
    setFormError("");
    try {
      await resetPassword({ token, password }).unwrap();
      toast.success("Password reset! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const msg = err?.data?.message || "Error resetting password";
      setFormError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout
      badge="Set a new password"
      title="Reset password"
      subtitle="Choose a strong password — at least 6 characters."
      footer={
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-cyan-300 transition-colors hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Login
        </Link>
      }
    >
      {!token && (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3.5 py-3 text-sm text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          This link looks incomplete. Request a fresh one from the forgot-password page.
        </p>
      )}
      {formError && (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <Input
          icon={KeyRound}
          label="New password"
          type="password"
          name="new-password"
          placeholder="Min. 6 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          icon={KeyRound}
          label="Confirm new password"
          type="password"
          name="confirm-password"
          placeholder="Repeat password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <PasswordStrengthMeter password={password} />
        <div className="mt-5">
          <Button type="submit" isLoading={isLoading}>
            {!isLoading && <KeyRound className="h-5 w-5" aria-hidden="true" />}
            {isLoading ? "Resetting…" : "Set new password"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
