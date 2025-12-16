// import { Outlet } from "react-router-dom";
// import Header from "@/components/layout/Header";

// const CustomerLayout = () => {
//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
//       <main className="pt-20">
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default CustomerLayout;

"use client";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ReactNode } from "react";
import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { connectSocket } from '@/services/socket';

interface CustomerLayoutProps {
  children: ReactNode;
}

const CustomerLayout = ({ children }: CustomerLayoutProps) => {
  const { user, token } = useAuth();

  useEffect(() => {
    // const role = user?.role ? String(user.role).trim().toLowerCase() : undefined;
    // Connect socket only if user is authenticated and is a customer
    const role = user?.role?.toLowerCase();
    if (role === 'customer' && token) {
      connectSocket(token);
    }
  }, [user?.role, token]);

  // Add debug logging to verify role and token during layout rendering
  console.log("CustomerLayout: user role", user?.role);
  console.log("CustomerLayout: token", token);

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">{children}</main>
      </div>
    </ProtectedRoute>
  );
};

export default CustomerLayout;
