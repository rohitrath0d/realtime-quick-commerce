"use client";

import { useEffect } from 'react';
// import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from '@/providers/AuthProvider';
import { connectSocket } from '@/services/socket';
import { ReactNode } from "react";
import Sidebar from '@/components/layout/Sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, token } = useAuth();

  useEffect(() => {
    const role = user?.role ? String(user.role).trim().toLowerCase() : undefined;
    if (role === 'admin' && token) {
      connectSocket(token);
    }
  }, [user?.role, token]);
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        <Sidebar role="admin" />
        <main className="ml-64 min-h-screen transition-all duration-300">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;
