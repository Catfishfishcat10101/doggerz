import { useEffect, useMemo, useState } from "react";

function CssDog({ pose = "idle" }) {
  const className = pose === "sleep" ? "css-dog sleep" : "css-dog";

  return (
    <div className={className} aria-label="Doggerz puppy">
      <span className="dog-tail" />
      <span className="dog-body" />
      <span className="dog-leg one" />
      <span className="dog-leg two" />
      <span className="dog-leg three" />
      <span className="dog-leg four" />
      <span className="dog-head" />
      <span className="dog-ear right" />
      <span className="dog-ear left" />
      <span className="dog-eye left" />
      <span className="dog-eye right" />
      <span className="dog-nose" />
      <span className="dog-smile" />
    </div>
  );
}

export default function DogAvatar({
  pose = "idle",
  size = "stage",
  className = "",
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageSource = useMemo(() => {
    if (pose === "sleep") {
      return "/assets/doggerz-sleeping.png";
    }

    return "/assets/doggerz-pup.png";
  }, [pose]);

  useEffect(() => {
    setImageFailed(false);
  }, [imageSource]);

  const sizeClass = {
    hero: "h-48 sm:h-56",
    stage: "h-40 sm:h-48",
    small: "h-24",
  }[size];

  if (imageFailed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <CssDog pose={pose} />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={imageSource}
        alt="Doggerz puppy"
        className={`${sizeClass} w-auto object-contain drop-shadow-[0_22px_22px_rgba(0,0,0,0.35)]`}
        draggable={false}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}
