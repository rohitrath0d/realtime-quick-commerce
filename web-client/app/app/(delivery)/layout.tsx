"use client";

import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import { connectSocket } from '@/services/socket';
import { useAuth } from '@/providers/AuthProvider';
import { ReactNode } from "react";

interface DeliveryLayoutProps {
  children: ReactNode;
}

const DeliveryLayout = ({ children }: DeliveryLayoutProps) => {
  const { user, token } = useAuth();

  useEffect(() => {
    const role = user?.role ? String(user.role).trim().toLowerCase() : undefined;
    if (role === 'delivery' && token) {
      connectSocket(token);
    }
  }, [user?.role, token]);

  return (
    <ProtectedRoute allowedRoles={["delivery"]}>
      <div className="min-h-screen bg-background">
        <Sidebar role="delivery" />
        <main className="ml-64 min-h-screen transition-all duration-300">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DeliveryLayout;
