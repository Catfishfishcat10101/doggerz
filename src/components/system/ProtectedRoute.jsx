// src/components/system/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { PATHS } from "@/app/routes.js";
import { selectIsAuthResolved } from "@/store/userSlice.js";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const authResolved = useSelector(selectIsAuthResolved);
  const adoptedAt = useSelector((state) => state?.dog?.adoptedAt || null);

  if (!authResolved) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-6 text-center text-doggerz-bone">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-doggerz-mint">
            Doggerz is checking...
          </div>
          <div className="mt-3 text-sm text-doggerz-paw">
            Loading your local and cloud save state.
          </div>
        </div>
      </div>
    );
  }

  if (!adoptedAt) {
    return <Navigate to={PATHS.ADOPT} replace state={{ from: location }} />;
  }

  return children;
}
