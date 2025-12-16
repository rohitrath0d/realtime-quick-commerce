// app/customer/default.tsx
"use client";

import { Suspense } from "react";
import Dashboard from "./customer/page";  // Import your dashboard component

const DefaultLayout = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
};

export default DefaultLayout;
