import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogIn, Menu, ShieldCheck, UserPlus, X, LogOut } from "lucide-react";
import { logoutUser } from "../slices/authSlice";
import { useLogoutMutation, apiSlice } from "../slices/apiSlice";
import toast from "react-hot-toast";

const linkCls = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.1)]"
      : "text-slate-400 hover:bg-white/5 hover:text-white"
  }`;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // clear locally even if the cookie is already gone
    } finally {
      dispatch(apiSlice.util.resetApiState());
      dispatch(logoutUser());
      setIsMenuOpen(false);
      toast.success("Logged out");
      navigate("/login");
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-ink-950/85 shadow-lg backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-black"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="Aurora Auth home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-glow transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Aurora<span className="text-gradient"> Auth</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
          <NavLink to="/" className={linkCls}>
            Home
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkCls}>
                <span className="inline-flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard
                </span>
              </NavLink>
              <span className="mx-2 hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 text-xs text-slate-300 lg:inline-flex">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 text-[11px] font-bold text-ink-950">
                  {(user?.name?.[0] || user?.email?.[0] || "?").toUpperCase()}
                </span>
                <span className="max-w-[10rem] truncate">{user?.name || user?.email}</span>
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:border-red-400/40 hover:text-red-200"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkCls}>
                <span className="inline-flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" aria-hidden="true" /> Login
                </span>
              </NavLink>
              <NavLink
                to="/signup"
                className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" /> Get started
              </NavLink>
            </>
          )}
        </nav>

        <button
          onClick={() => setIsMenuOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 sm:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/5 bg-ink-950/95 backdrop-blur-xl sm:hidden"
            aria-label="Mobile"
          >
            <div className="space-y-1 px-4 py-4">
              {[
                { to: "/", label: "Home" },
                ...(isAuthenticated
                  ? [{ to: "/dashboard", label: "Dashboard" }]
                  : [
                      { to: "/login", label: "Login" },
                      { to: "/signup", label: "Sign up" },
                    ]),
              ].map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-left text-sm font-medium text-red-200"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
