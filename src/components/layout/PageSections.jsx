export function PageHeader({
  children,
  className = "",
  unstyled = false,
  ...props
}) {
  const base = unstyled
    ? ""
    : "space-y-3 rounded-2xl border border-emerald-400/20 bg-black/25 px-4 py-4 shadow-[0_10px_24px_rgba(2,6,23,0.35)]";
  return (
    <header className={`${base} ${className}`.trim()} {...props}>
      {children}
    </header>
  );
}

export function PageFooter({
  children,
  className = "",
  unstyled = false,
  ...props
}) {
  const base = unstyled
    ? ""
    : "mt-8 border-t border-emerald-400/20 pt-4 text-sm text-zinc-300";
  return (
    <footer className={`${base} ${className}`.trim()} {...props}>
      {children}
    </footer>
  );
}
