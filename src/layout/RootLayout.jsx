import React from "react";
import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
