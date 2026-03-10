export default function ModalSurface({
  open = false,
  onClose = null,
  title = "Dialog",
  variant = "center", // "center" | "sheet"
  zIndexClass = "z-[90]",
  panelClassName = "",
  children,
}) {
  if (!open) return null;

  const isSheet = String(variant || "center").toLowerCase() === "sheet";

  return (
    <div
      className={[
        "dz-modal-backdrop",
        `fixed inset-0 ${zIndexClass} flex bg-black/65 px-4 py-6`,
        isSheet ? "items-end justify-center" : "items-center justify-center",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (typeof onClose !== "function") return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[
          "dz-modal-panel",
          "w-full max-w-md border border-white/15 bg-zinc-950 p-6 text-zinc-100",
          isSheet
            ? "dz-sheet-panel rounded-t-3xl rounded-b-none shadow-[0_-20px_60px_rgba(0,0,0,0.55)]"
            : "dz-center-panel rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
          panelClassName,
        ].join(" ")}
      >
        {children}
        {typeof onClose === "function" ? (
          <button
            type="button"
            onClick={onClose}
            className="sr-only"
            aria-label={`Close ${title}`}
          >
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
