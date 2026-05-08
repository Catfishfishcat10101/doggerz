// src/App.jsx
import AppRouter from "@app/AppRouter.jsx";
import { ModalProvider } from "@/components/ui/modals/ModalProvider";
import ModalHost from "@/components/ui/modals/ModalHost";

export default function App() {
  return (
    <ModalProvider>
      <AppRouter />
      <ModalHost />
    </ModalProvider>
    );
}

