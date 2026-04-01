export const FloatingBackdrop = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute -left-10 top-20 h-64 w-64 rounded-full bg-brand-200/12 blur-3xl animate-float" />
    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-brand-300/8 blur-3xl animate-pulseSoft" />
  </div>
);
