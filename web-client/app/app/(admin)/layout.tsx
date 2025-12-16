"use client";

import { useEffect } from 'react';
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from '@/providers/AuthProvider';
import { connectSocket } from '@/services/socket';
import { ReactNode } from "react";

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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20"><ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute></main>
    </div>
  );
};

export default AdminLayout;
