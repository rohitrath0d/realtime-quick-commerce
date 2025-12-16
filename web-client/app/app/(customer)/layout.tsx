"use client";

import { useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from '@/providers/AuthProvider';
import { connectSocket } from '@/services/socket';
import { ReactNode } from "react";

interface CustomerLayoutProps {
  children: ReactNode;
}

const CustomerLayout = ({ children }: CustomerLayoutProps) => {
  const { user, token } = useAuth();

  useEffect(() => {
    const role = user?.role?.toLowerCase();
    if (role === 'customer' && token) {
      connectSocket(token);
    }
  }, [user?.role, token]);

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen bg-background">
        <Sidebar role="customer" />
        <main className="ml-64 min-h-screen transition-all duration-300">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default CustomerLayout;
