import PageShell from "@/components/layout/PageShell.jsx";

const WIDTH_CLASS = Object.freeze({
  text: "mx-auto w-full max-w-3xl",
  wide: "mx-auto w-full max-w-5xl",
});

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
      containerClassName={containerClassName || WIDTH_CLASS[width] || width}
      useSurface={useSurface}
    >
      {children}
    </PageShell>
  );
}
