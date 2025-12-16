// "use client";

// import { useEffect } from "react";
// import Unauthorized from './Unauthorized';
// import { usePathname, useRouter } from "next/navigation";
// import { useAuth } from "@/providers/AuthProvider";

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   allowedRoles?: string[]; // e.g., ['customer']
// }

// const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
//   const { isLoading, isAuthenticated, user } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname();
//   // compute unauthorized based on allowed roles and user role

//   useEffect(() => {
//     if (isLoading) return;
//     if (!isAuthenticated) {
//       // redirect to login with `from` param
//       router.replace(`/login?from=${encodeURIComponent(pathname || "/")}`);
//       return;
//     }

//     // don't set state here; we'll compute unauthorized below to avoid render loops
//   }, [isLoading, isAuthenticated, allowedRoles, user, router, pathname]);

//   if (isLoading || !isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center min-h-[50vh]">
//         <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }
//   const userRoleLower = user?.role ? String(user.role).trim().toLowerCase() : undefined;
//   const allowedLower = (allowedRoles || []).map((r) => String(r).trim().toLowerCase());
//   const unauthorized = allowedLower.length > 0 && (!userRoleLower || !allowedLower.includes(userRoleLower));

//   if (unauthorized) {
//     return <Unauthorized userRole={user?.role} />;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;


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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname || "/")}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Show spinner while auth state is loading
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Check for role-based access
  const userRoleLower = user?.role?.toLowerCase();
  const allowedLower = (allowedRoles || []).map(r => r.toLowerCase());
  const unauthorized = allowedLower.length > 0 && (!userRoleLower || !allowedLower.includes(userRoleLower));

  // Add debug logging to verify role validation logic
  console.log("ProtectedRoute: allowedRoles", allowedRoles);
  console.log("ProtectedRoute: user role", user?.role);

  if (unauthorized) {
    return <Unauthorized userRole={user?.role} />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
