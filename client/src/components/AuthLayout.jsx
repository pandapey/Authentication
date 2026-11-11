import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const ease = [0.22, 1, 0.36, 1];

const AuthLayout = ({
  children,
  title,
  subtitle,
  badge,
  footer,
  wide = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.45, ease }}
    className={`relative z-10 w-full ${
      wide ? "max-w-3xl" : "max-w-md"
    } px-4 sm:px-0`}
  >
    <div className="glass-strong relative overflow-hidden rounded-3xl shadow-card">
      {/* top gradient hairline */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent"
        aria-hidden="true"
      />
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-glow"
          >
            <ShieldCheck className="h-7 w-7 text-white" aria-hidden="true" />
          </motion.div>
          {badge && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
              {badge}
            </span>
          )}
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
      {footer && (
        <div className="border-t border-white/5 bg-black/30 px-6 py-4 text-center sm:px-8">
          {footer}
        </div>
      )}
    </div>
    <p className="mt-5 text-center text-xs text-slate-500">
      Protected by rate limiting, OTP lockout &amp; secure cookies.{" "}
      <Link to="/" className="link-accent text-xs">
        Learn more
      </Link>
    </p>
  </motion.div>
);

export default AuthLayout;
