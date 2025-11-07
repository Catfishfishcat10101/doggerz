// src/components/UI/DogSprite.jsx
const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 192 192'>
    <rect width='100%' height='100%' fill='#0c0a09'/>
    <g transform='translate(16,16)'>
      <circle cx='80' cy='80' r='60' fill='#fde68a'/>
      <circle cx='65' cy='80' r='8' fill='#111827'/>
      <circle cx='95' cy='80' r='8' fill='#111827'/>
      <circle cx='80' cy='100' r='6' fill='#7f1d1d'/>
    </g>
  </svg>`);

export default function DogSprite({ src = "/sprites/jackrussell/idle.svg", alt = "Dog" }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-[192px] h-[192px] object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
      onError={(e) => {
        if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK;
      }}
      draggable={false}
    />
  );
}