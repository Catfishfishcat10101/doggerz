import * as React from "react";

import { ModalContext } from "@/components/ui/modals/ModalContext.js";

export function ModalProvider({ children }) {
  const [stack, setStack] = React.useState([]);
  const openedKeysRef = React.useRef(new Set());

  const active = stack.length ? stack[stack.length - 1] : null;

  const isOpen = React.useCallback(
    (id) => {
      const key = String(id || "");
      if (!key) return false;
      return stack.some((entry) => String(entry?.id || "") === key);
    },
    [stack]
  );

  const openModal = React.useCallback((id, props = null, opts = {}) => {
    const key = String(id || "").trim();
    if (!key) return false;

    const entry = {
      id: key,
      props: props && typeof props === "object" ? props : {},
    };
    const replace = opts?.replace === true;

    setStack((curr) => {
      if (replace) return [entry];
      return [...curr, entry];
    });
    return true;
  }, []);

  const openOnce = React.useCallback(
    (onceKey, id, props = null, opts = {}) => {
      const k = String(onceKey || "").trim() || String(id || "").trim();
      if (!k) return false;
      if (openedKeysRef.current.has(k)) return false;
      openedKeysRef.current.add(k);
      return openModal(id, props, opts);
    },
    [openModal]
  );

  const closeModal = React.useCallback(() => {
    setStack((curr) => (curr.length ? curr.slice(0, -1) : curr));
  }, []);

  const closeModalById = React.useCallback((id) => {
    const key = String(id || "").trim();
    if (!key) return;
    setStack((curr) => {
      const next = curr.filter((entry) => String(entry?.id || "") !== key);
      return next.length === curr.length ? curr : next;
    });
  }, []);

  const api = React.useMemo(
    () => ({
      active,
      stack,
      isOpen,
      openModal,
      openOnce,
      closeModal,
      closeModalById,
    }),
    [active, closeModal, closeModalById, isOpen, openModal, openOnce, stack]
  );

  return <ModalContext.Provider value={api}>{children}</ModalContext.Provider>;
}
