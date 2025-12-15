"use client";
// import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NotFound = () => {
  // const location = useLocation();
  const pathname = usePathname();

  useEffect(() => {
    // console.error("404 Error: User attempted to access non-existent route:", pathname);
    // }, [location.pathname]);

    if (process.env.NODE_ENV === "development") {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        pathname
      );
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        {/* <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a> */}
        <Link href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
