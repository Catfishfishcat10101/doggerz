// src/components/ui/modals/ModalHost.jsx
import { useModal } from "@/hooks/useModal.js";
import { renderModal } from "@/components/ui/modals/modalRegistry.jsx";

export default function ModalHost() {
  const { active, closeModal } = useModal();
  return active ? renderModal(active, { closeModal }) : null;
}
