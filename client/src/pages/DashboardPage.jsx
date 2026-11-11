import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { formatDate } from "../utils/formatDate";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { logoutUser } from "../slices/authSlice";
import { useLogoutMutation, apiSlice } from "../slices/apiSlice";
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  Clock,
  LogOut,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const ease = [0.22, 1, 0.36, 1];

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      dispatch(apiSlice.util.resetApiState());
      dispatch(logoutUser());
      toast.success("Logged out");
      navigate("/login");
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const initials = (user.name?.[0] || user.email?.[0] || "?").toUpperCase();
  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="relative z-10 w-full max-w-3xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="glass-strong overflow-hidden rounded-3xl shadow-card"
      >
        <div className="relative border-b border-white/5 bg-gradient-to-r from-indigo-600/25 via-violet-600/15 to-cyan-500/20 p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent" aria-hidden="true" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <motion.span
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 via-violet-500 to-cyan-400 font-display text-2xl font-extrabold text-ink-950 shadow-glow"
              aria-hidden="true"
            >
              {initials}
            </motion.span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Dashboard</p>
              <h1 className="font-display mt-1 truncate text-2xl font-bold text-white sm:text-3xl">
                Hey, {user.name}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{user.email}</span>
                </span>
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified
                  </span>
                ) : (
                  <Link
                    to="/verify-email"
                    className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/20"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verify email
                  </Link>
                )}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition-all hover:bg-red-500/20 active:scale-[0.98] disabled:opacity-60 sm:w-auto"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {isLoading ? "Logging out…" : "Logout"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5, ease }}
            className="rounded-2xl border border-white/5 bg-black/25 p-5"
            aria-label="Profile information"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
              <UserIcon className="h-4 w-4 text-indigo-300" aria-hidden="true" />
              Profile
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Name</dt>
                <dd className="truncate font-medium text-white">{user.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Email</dt>
                <dd className="max-w-[60%] truncate font-medium text-white">{user.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Status</dt>
                <dd className={user.isVerified ? "font-medium text-emerald-300" : "font-medium text-amber-300"}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </dd>
              </div>
            </dl>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5, ease }}
            className="rounded-2xl border border-white/5 bg-black/25 p-5"
            aria-label="Account activity"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
              <Activity className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              Activity
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <span>
                  <span className="block text-slate-500">Joined</span>
                  <span className="font-medium text-white">{joined}</span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <span>
                  <span className="block text-slate-500">Last login</span>
                  <span className="font-medium text-white">{formatDate(user.lastLogin)}</span>
                </span>
              </li>
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease }}
            className="rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 p-5 sm:col-span-2"
            aria-label="Security"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              Security checklist
            </h2>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              {[
                { ok: true, label: "HttpOnly session cookie" },
                { ok: user.isVerified, label: user.isVerified ? "Email verified" : "Email not verified" },
                { ok: true, label: "Rate-limited endpoints" },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2.5 text-slate-300"
                >
                  <BadgeCheck
                    className={`h-4 w-4 shrink-0 ${item.ok ? "text-emerald-300" : "text-amber-300"}`}
                    aria-hidden="true"
                  />
                  {item.label}
                </li>
              ))}
            </ul>
            {!user.isVerified && (
              <Link
                to="/verify-email"
                className="btn-ghost mt-4 sm:w-auto sm:px-6"
              >
                Verify your email now
              </Link>
            )}
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
