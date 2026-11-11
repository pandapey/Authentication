import { motion } from "framer-motion";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../components/AuthLayout";
import { AlertCircle, Lock, Mail, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useSignupMutation } from "../slices/apiSlice";
import { useDispatch } from "react-redux";
import { setUser, setAuthenticated } from "../slices/authSlice";
import { toast } from "react-hot-toast";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const [signup, { isLoading }] = useSignupMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!emailRe.test(cleanEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }
    if (password.length > 72) {
      setFormError("Password must be at most 72 characters long.");
      return;
    }
    setFormError("");
    try {
      const result = await signup({ name: cleanName, email: cleanEmail, password }).unwrap();
      if (result?.user) {
        dispatch(setUser(result.user));
        dispatch(setAuthenticated(true));
        // No success toast here — "Account created successfully" is shown
        // after the email is verified. Navigate immediately (replace, so
        // Back never returns to a stale filled signup form).
        navigate("/verify-email", { replace: true });
      }
    } catch (err) {
      const msg = err?.data?.message || "Failed to sign up";
      setFormError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout
      badge="Get started"
      title="Create your account"
      subtitle="One account for everything. Verification takes ~30 seconds."
      footer={
        <p className="text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="link-accent">
            Login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSignUp} noValidate>
        <Input
          icon={User}
          label="Full name"
          name="name"
          placeholder="Ada Lovelace"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <Input
          icon={Lock}
          label="Password"
          type="password"
          name="password"
          placeholder="Min. 6 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {formError && (
          <p role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        )}
        <motion.div layout>
          <PasswordStrengthMeter password={password} />
        </motion.div>
        <div className="mt-5">
          <Button type="submit" isLoading={isLoading}>
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            Create account
          </Button>
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
          By signing up you agree to receive a verification email. OTPs expire in 5 minutes.
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignUpPage;
