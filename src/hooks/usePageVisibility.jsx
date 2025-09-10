import { useEffect } from "react";

/**
 * Visibility helpers.
 * @param {{onShow?:()=>void, onHide?:()=>void}} opts
 */
export default function usePageVisibility({ onShow, onHide } = {}) {
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") onShow && onShow();
      else onHide && onHide();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [onShow, onHide]);
  return document.visibilityState === "visible";
}
