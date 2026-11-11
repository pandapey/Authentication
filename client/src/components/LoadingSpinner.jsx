const LoadingSpinner = ({ fullScreen = true, label = "Loading…" }) => {
  const spinner = (
    <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-300 border-r-indigo-400" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/20 blur-[1px]" />
      </div>
      <p className="text-sm font-medium text-slate-400">{label}</p>
    </div>
  );

  if (!fullScreen) {
    return <div className="flex items-center justify-center py-16">{spinner}</div>;
  }

  return (
    <div className="relative z-10 flex min-h-[50vh] items-center justify-center px-4">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
