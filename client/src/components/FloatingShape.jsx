// CSS-only ambient shape — keeps the old prop API but avoids a
// per-frame JS animation loop (better for battery + mobile).
const FloatingShape = ({ color, size, top, left, delay = 0 }) => (
  <div
    aria-hidden="true"
    className={`aurora-orb ${color} ${size} animate-drift opacity-20 blur-2xl`}
    style={{ top, left, animationDelay: `${delay}s` }}
  />
);

export default FloatingShape;
