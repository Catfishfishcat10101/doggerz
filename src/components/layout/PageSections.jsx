export function PageHeader({
  children,
  className = "",
  unstyled = false,
  ...props
}) {
  const base = unstyled ? "" : "space-y-2";
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
  const base = unstyled ? "" : "pt-2";
  return (
    <footer className={`${base} ${className}`.trim()} {...props}>
      {children}
    </footer>
  );
}
