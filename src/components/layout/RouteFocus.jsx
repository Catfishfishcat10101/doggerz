import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function RouteFocus() {
  const { pathname } = useLocation();
  const ref = useRef(null);
  useEffect(() => {
    const id = setTimeout(() => ref.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [pathname]);
  return <div ref={ref} tabIndex={-1} aria-hidden="true" />;
}
