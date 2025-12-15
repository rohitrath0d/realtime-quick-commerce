"use client";

import { useEffect } from "react";
import Unauthorized from './Unauthorized';
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // e.g., ['customer']
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // compute unauthorized based on allowed roles and user role

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      // redirect to login with `from` param
      router.replace(`/login?from=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    // don't set state here; we'll compute unauthorized below to avoid render loops
  }, [isLoading, isAuthenticated, allowedRoles, user, router, pathname]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  const userRoleLower = user?.role ? String(user.role).trim().toLowerCase() : undefined;
  const allowedLower = (allowedRoles || []).map((r) => String(r).trim().toLowerCase());
  const unauthorized = allowedLower.length > 0 && (!userRoleLower || !allowedLower.includes(userRoleLower));

  if (unauthorized) {
    return <Unauthorized userRole={user?.role} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
