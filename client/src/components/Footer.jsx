import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const Footer = () => (
  <footer className="relative z-10 border-t border-white/5 bg-black/30 backdrop-blur-xl">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400">
          <ShieldCheck className="h-4 w-4 text-white" aria-hidden="true" />
        </span>
        <span className="text-slate-400">
          © {new Date().getFullYear()} <span className="font-semibold text-slate-200">Aurora Auth</span> · Secure MERN starter
        </span>
      </div>
      <nav className="flex items-center gap-5 text-xs font-medium text-slate-500" aria-label="Footer">
        <Link to="/" className="transition-colors hover:text-slate-200">Home</Link>
        <Link to="/login" className="transition-colors hover:text-slate-200">Login</Link>
        <Link to="/signup" className="transition-colors hover:text-slate-200">Sign up</Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          All systems normal
        </span>
      </nav>
    </div>
  </footer>
);

export default Footer;
