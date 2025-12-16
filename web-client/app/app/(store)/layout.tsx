"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Package, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from 'react';
import { connectSocket } from '@/services/socket';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StoreLayoutProps {
  children: ReactNode;
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  const pathname = usePathname() || "/";
  const { user, logout, token } = useAuth();

  useEffect(() => {
    const role = user?.role ? String(user.role).trim().toLocaleLowerCase() : undefined;
    if (role === 'store' && token) {
      connectSocket(token);
    }
  }, [user?.role, token]);

  const navItems = [{ path: "/store", icon: Package, label: "Orders" }];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">QuickDash</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              Store
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={pathname === item.path ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <ProtectedRoute allowedRoles={["store"]}>{children}</ProtectedRoute>
      </main>
    </div>
  );
};

export default StoreLayout;