export function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_68%)]" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:3rem_3rem]" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-[linear-gradient(to_bottom,transparent,var(--background))]" />
    </div>
  );
}
