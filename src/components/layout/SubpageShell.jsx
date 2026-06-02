import PageShell from "@/components/layout/PageShell.jsx";

export default function SubpageShell({
  children,
  width = "text",
  className = "",
  mainClassName = "px-4 pb-28 pt-4 sm:px-6 sm:pt-6",
  containerClassName,
  useSurface = true,
}) {
  return (
    <PageShell
      className={className}
      mainClassName={mainClassName}
      containerClassName={containerClassName}
      useSurface={useSurface}
      width={width}
    >
      {children}
    </PageShell>
  );
}
