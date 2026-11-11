import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({ icon: Icon, label, error, id, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === "password";
  const inputId = id || props.name || props.placeholder?.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Icon className="h-5 w-5 text-indigo-300/80" aria-hidden="true" />
          </div>
        )}
        <input
          id={inputId}
          {...props}
          type={isPassword && showPassword ? "text" : props.type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`field ${Icon ? "pl-11" : "pl-4"} ${
            isPassword ? "pr-11" : "pr-4"
          } ${error ? "!border-red-400/70 !ring-red-500/30" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 transition-colors hover:text-cyan-300 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-300">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
