import * as React from "react";

import { ModalContext } from "@/components/ui/modals/ModalContext.js";

export function useModal() {
  const ctx = React.useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within <ModalProvider />");
  }
  return ctx;
}

export default useModal;
