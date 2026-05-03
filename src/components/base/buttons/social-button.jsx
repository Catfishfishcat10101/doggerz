<<<<<<< HEAD
=======
// src/components/base/buttons/social-button.jsx
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
const SOCIAL_META = Object.freeze({
  google: Object.freeze({
    label: "Google",
    brandClasses:
      "border-zinc-200/80 bg-white text-zinc-900 hover:bg-zinc-100 hover:border-white",
    badgeClasses:
      "bg-[linear-gradient(135deg,#4285F4_0%,#34A853_35%,#FBBC05_68%,#EA4335_100%)] text-white",
    icon: "G",
  }),
  facebook: Object.freeze({
    label: "Facebook",
    brandClasses:
      "border-[#1877F2]/70 bg-[#1877F2] text-white hover:bg-[#2d87ff] hover:border-[#4b97ff]",
    badgeClasses: "bg-white/15 text-white",
    icon: "f",
  }),
  apple: Object.freeze({
    label: "Apple",
    brandClasses:
      "border-white/15 bg-zinc-950 text-white hover:bg-black hover:border-white/30",
    badgeClasses: "bg-white/10 text-white",
    icon: "",
  }),
});

function resolveSocialMeta(social) {
  const key = String(social || "google")
    .trim()
    .toLowerCase();
  return SOCIAL_META[key] || SOCIAL_META.google;
}

export function SocialButton({
  social = "google",
  theme = "brand",
  children,
  className = "",
  type = "button",
  ...props
}) {
  const meta = resolveSocialMeta(social);
  const isBrandTheme =
    String(theme || "brand")
      .trim()
      .toLowerCase() === "brand";

  const buttonClassName = [
    "dz-touch-button inline-flex w-full touch-manipulation items-center justify-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold shadow-lg transition active:scale-[0.99]",
    isBrandTheme
      ? meta.brandClasses
      : "border-white/15 bg-black/30 text-zinc-100 hover:bg-white/10",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={buttonClassName} {...props}>
      <span
        aria-hidden="true"
        className={[
          "grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-black",
          isBrandTheme ? meta.badgeClasses : "bg-white/10 text-white",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {meta.icon}
      </span>
      <span>{children || `Continue with ${meta.label}`}</span>
    </button>
  );
}

export default SocialButton;
