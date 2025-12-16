"use client";

import { useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import { connectSocket } from '@/services/socket';
import { useAuth } from '@/providers/AuthProvider';
import { ReactNode } from "react";

interface StoreLayoutProps {
  children: ReactNode;
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  const { user, token } = useAuth();

  useEffect(() => {
    const role = user?.role ? String(user.role).trim().toLocaleLowerCase() : undefined;
    if (role === 'store' && token) {
      connectSocket(token);
    }
  }, [user?.role, token]);

  return (
    <ProtectedRoute allowedRoles={["store"]}>
      <div className="min-h-screen bg-background">
        <Sidebar role="store" />
        <main className="ml-64 min-h-screen transition-all duration-300">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default StoreLayout;