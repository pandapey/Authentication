import { useState } from "react";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../components/AuthLayout";
import { useLoginMutation } from "../slices/apiSlice";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser, setAuthenticated } from "../slices/authSlice";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !emailRe.test(cleanEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setFormError("Please enter your password.");
      return;
    }
    setFormError("");
    try {
      const userData = await login({ email: cleanEmail, password }).unwrap();
      dispatch(setUser(userData.user));
      dispatch(setAuthenticated(true));
      toast.success(`Welcome back, ${userData.user?.name || "friend"}!`);
      navigate(userData.user?.isVerified ? "/dashboard" : "/verify-email");
    } catch (err) {
      const msg = err?.data?.message || "Failed to login";
      setFormError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout
      badge="Welcome back"
      title="Login to Aurora"
      subtitle="Access your dashboard with your secure session."
      footer={
        <p className="text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="link-accent">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} noValidate>
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
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="mb-5 flex items-center justify-between text-sm">
          <span className="text-slate-500">Protected by rate limiting</span>
          <Link to="/forgot-password" className="link-accent">
            Forgot password?
          </Link>
        </div>

        {formError && (
          <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        )}

        <Button type="submit" isLoading={isLoading}>
          <LogIn className="h-5 w-5" aria-hidden="true" />
          Login securely
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
