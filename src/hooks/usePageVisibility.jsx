import { useEffect, useState } from "react";

/** Returns true when the tab is visible. */
export default function usePageVisibility() {
  const [visible, setVisible] = useState(!document.hidden);

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return visible;
}
