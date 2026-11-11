import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  LogIn,
  MailCheck,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";
import Reveal from "../components/Reveal";

const ease = [0.22, 1, 0.36, 1];

const features = [
  {
    icon: MailCheck,
    title: "Email verification",
    text: "6-digit OTP with attempt limits, 5-minute expiry and a server-enforced resend cooldown.",
    accent: "from-indigo-500/20 to-indigo-500/0 text-indigo-300",
  },
  {
    icon: KeyRound,
    title: "Password reset",
    text: "Hashed reset tokens, 1-hour expiry and generic responses that prevent email enumeration.",
    accent: "from-cyan-500/20 to-cyan-500/0 text-cyan-300",
  },
  {
    icon: Fingerprint,
    title: "Secure sessions",
    text: "HttpOnly JWT cookies, protected routes, rate-limited auth endpoints and sanitized API output.",
    accent: "from-emerald-500/20 to-emerald-500/0 text-emerald-300",
  },
];

const stats = [
  { value: "7d", label: "Session lifetime" },
  { value: "5", label: "OTP attempt cap" },
  { value: "60s", label: "Resend cooldown" },
  { value: "100%", label: "Tested flows" },
];

const HomePage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const reduce = useReducedMotion();

  return (
    <div className="relative z-10 w-full px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-5xl">
        {/* Hero card */}
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-card sm:p-12"
        >
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                MERN · Redux Toolkit · Secure cookies
              </span>
              <h1 className="font-display mt-5 text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl">
                Authentication that feels{" "}
                <span className="text-gradient">premium.</span>
              </h1>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-400">
                {isAuthenticated && user
                  ? `Welcome back, ${user.name}. Your session is active${user.isVerified ? " and your email is verified" : ""}. Head to your dashboard to continue.`
                  : "Secure signup, OTP email verification, login sessions and password reset — wrapped in a fast, accessible, production-ready UI."}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="btn-primary sm:w-auto sm:px-8"
                  >
                    <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn-primary sm:w-auto sm:px-8">
                      <UserPlus className="h-5 w-5" aria-hidden="true" />
                      Create account
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link to="/login" className="btn-ghost sm:w-auto sm:px-8">
                      <LogIn className="h-5 w-5" aria-hidden="true" />
                      Login
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-8 grid max-w-md grid-cols-4 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-white/5 bg-black/25 px-2 py-3 text-center"
                  >
                    <div className="font-display text-lg font-bold text-white">{s.value}</div>
                    <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual: session card mock */}
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.94, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease }}
              className="relative mx-auto w-full max-w-xs"
            >
              <div className="glass animate-floaty rounded-2xl p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                    <ShieldCheck className="h-6 w-6 text-ink-950" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">Session active</p>
                    <p className="flex items-center gap-1.5 text-xs text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      HttpOnly cookie · 7d
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5">
                  {["OTP verified", "Rate limits on", "Secrets sanitized"].map((t) => (
                    <div key={t} className="flex items-center gap-2.5 rounded-xl bg-black/30 px-3 py-2.5 text-xs text-slate-300">
                      <Zap className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                      {t}
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features */}
        <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Features">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <article className="glass card-hover group h-full rounded-3xl p-6">
                <span className={`inline-flex rounded-2xl bg-gradient-to-b p-3 ${f.accent}`}>
                  <f.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="font-display mt-4 text-lg font-bold text-white">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
              </article>
            </Reveal>
          ))}
        </section>

        {/* CTA strip */}
        <Reveal delay={0.1}>
          <section className="mt-8 flex flex-col items-center justify-between gap-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-cyan-500/20 p-7 sm:flex-row sm:p-8">
            <div>
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
                {isAuthenticated ? "You're all set. Explore your dashboard." : "Ready in under a minute."}
              </h2>
              <p className="mt-1 text-sm text-slate-300/90">
                {isAuthenticated
                  ? "Review your profile, activity and session controls."
                  : "Create an account, verify the 6-digit code, and you're in."}
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/dashboard" : "/signup"}
              className="btn-primary shrink-0 sm:w-auto sm:px-8"
            >
              {isAuthenticated ? "Open dashboard" : "Start now"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </Reveal>
      </div>
    </div>
  );
};

export default HomePage;
