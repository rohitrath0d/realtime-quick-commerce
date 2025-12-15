"use client";

// import { Link, useLocation } from "react-router-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, User, Truck, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

const Header = () => {
  // const location = useLocation();
  const location = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getActivePanel = () => {
    // if (location.pathname.startsWith("/customer")) return "customer";
    if (location.startsWith("/customer")) return "customer";
    // if (location.pathname.startsWith("/delivery")) return "delivery";
    if (location.startsWith("/delivery")) return "delivery";
    // if (location.pathname.startsWith("/admin")) return "admin";
    if (location.startsWith("/admin")) return "admin";
    return null;
  };

  const activePanel = getActivePanel();

  const { isAuthenticated, user, logout } = useAuth();

  // Only show navigation relevant to the authenticated user's role.
  let navItems = [] as { path: string; label: string; icon: any }[];
  if (isAuthenticated && user?.role) {
    const role = String(user.role).trim().toLowerCase();
    switch (role) {
      case "customer":
        navItems = [{ path: "/customer", label: "Customer", icon: User }];
        break;
      case "delivery":
        navItems = [{ path: "/delivery", label: "Delivery", icon: Truck }];
        break;
      case "admin":
        navItems = [{ path: "/admin", label: "Admin", icon: LayoutDashboard }];
        break;
      case "store":
        navItems = [{ path: "/store", label: "Store", icon: Package }];
        break;
      default:
        navItems = [];
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {/* <Link to="/" className="flex items-center gap-2 group"> */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-110">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">QuickDash</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={activePanel === item.path.slice(1) ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}

            {/* Auth controls */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
                <Button size="sm" variant="ghost" onClick={logout}>Logout</Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out",
          mobileMenuOpen ? "max-h-48 border-t" : "max-h-0"
        )}
      >
        <nav className="container mx-auto px-4 py-3 flex flex-col gap-2">
          {navItems.map((item) => (
            // <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
            <Link key={item.path} href={item.path} onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={activePanel === item.path.slice(1) ? "default" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          ))}

              {!isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{user?.name}</span>
                  <Button variant="ghost" onClick={() => { setMobileMenuOpen(false); logout(); }}>Logout</Button>
                </div>
              )}
        </nav>
      </div>
    </header>
  );
};

export default Header;