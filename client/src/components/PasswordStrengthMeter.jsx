import { Check, X } from "lucide-react";

const PasswordCriteria = ({ password }) => {
  const criteria = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Upper & lowercase letters", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a symbol", met: /[^A-Za-z0-9]/.test(password) },
  ];
  return (
    <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {criteria.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-xs">
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full ${
              item.met ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-slate-500"
            }`}
          >
            {item.met ? (
              <Check className="h-3 w-3" aria-hidden="true" />
            ) : (
              <X className="h-3 w-3" aria-hidden="true" />
            )}
          </span>
          <span className={item.met ? "text-slate-200" : "text-slate-500"}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
};

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };
  const strength = getStrength(password);

  const bars = [
    { color: "bg-red-400" },
    { color: "bg-amber-400" },
    { color: "bg-lime-300" },
    { color: "bg-emerald-400" },
  ];

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const label = password ? labels[strength] : "—";

  return (
    <div className="mt-3 rounded-xl border border-white/5 bg-black/20 p-3" aria-live="polite">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">
          Password strength
        </span>
        <span className="font-semibold text-slate-200">{label}</span>
      </div>
      <div className="flex gap-1.5" role="img" aria-label={`Password strength: ${label}`}>
        {bars.map((bar, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              index < strength ? bar.color : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <PasswordCriteria password={password} />
    </div>
  );
};

export default PasswordStrengthMeter;
