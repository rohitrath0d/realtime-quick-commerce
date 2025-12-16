"use client";

import { useEffect } from "react";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20"><ProtectedRoute allowedRoles={["delivery"]}>{children}</ProtectedRoute></main>
    </div>
  );
};

export default DeliveryLayout;
