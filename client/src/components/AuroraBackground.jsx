const AuroraBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {/* base aurora wash */}
    <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(99,102,241,0.25),transparent_70%),radial-gradient(50%_45%_at_85%_15%,rgba(34,211,238,0.18),transparent_70%),radial-gradient(55%_55%_at_50%_100%,rgba(52,211,153,0.14),transparent_70%)]" />
    <div className="bg-grid absolute inset-0" />
    {/* drifting orbs — CSS animation only, no JS loop */}
    <div className="aurora-orb left-[-8%] top-[-10%] h-[34rem] w-[34rem] animate-drift bg-indigo-600/40" />
    <div
      className="aurora-orb right-[-10%] top-[20%] h-[28rem] w-[28rem] animate-drift-slow bg-cyan-500/30"
      style={{ animationDelay: "-8s" }}
    />
    <div
      className="aurora-orb bottom-[-18%] left-[30%] h-[26rem] w-[26rem] animate-drift bg-emerald-500/25"
      style={{ animationDelay: "-14s" }}
    />
    {/* vignette for readability */}
    <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_40%,transparent_40%,rgba(7,11,22,0.75)_100%)]" />
  </div>
);

export default AuroraBackground;
