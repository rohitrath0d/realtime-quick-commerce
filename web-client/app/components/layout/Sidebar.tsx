"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Truck,
  Store,
  ShoppingCart,
  ClipboardList,
  PlusCircle,
  Home,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  role: "admin" | "store" | "delivery" | "customer";
}

const navConfigs: Record<string, NavItem[]> = {
  admin: [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/orders", label: "All Orders", icon: Package },
    { path: "/admin/delivery-partners", label: "Delivery Partners", icon: Truck },
    { path: "/admin/stores", label: "Stores", icon: Store },
  ],
  store: [
    { path: "/store", label: "Dashboard", icon: LayoutDashboard },
    { path: "/store/orders", label: "Orders", icon: ClipboardList },
    { path: "/store/products", label: "Products", icon: Package },
    { path: "/store/add-product", label: "Add Product", icon: PlusCircle },
    { path: "/store/my-store", label: "My Store", icon: Store },
  ],
  delivery: [
    { path: "/delivery", label: "Dashboard", icon: LayoutDashboard },
    { path: "/delivery/my-orders", label: "My Orders", icon: Package },
    { path: "/delivery/available", label: "Available Orders", icon: ClipboardList },
    { path: "/delivery/profile", label: "Profile", icon: User },
  ],
  customer: [
    { path: "/customer", label: "Shop", icon: Home },
    { path: "/orders", label: "My Orders", icon: Package },
    { path: "/cart", label: "Cart", icon: ShoppingCart },
  ],
};

const roleColors: Record<string, string> = {
  admin: "from-purple-500 to-indigo-600",
  store: "from-orange-500 to-red-600",
  delivery: "from-green-500 to-teal-600",
  customer: "from-blue-500 to-cyan-600",
};

const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = navConfigs[role] || [];

  const isActive = (path: string) => {
    if (path === `/${role}` || path === "/customer") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "h-16 border-b border-border flex items-center px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
              roleColors[role]
            )}>
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">QuickDash</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <span className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r",
            roleColors[role]
          )}>
            {role.charAt(0).toUpperCase() + role.slice(1)} Panel
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <Button
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                collapsed && "justify-center px-0",
                isActive(item.path) && "bg-primary/10 text-primary font-medium"
              )}
            >
              <item.icon className={cn("w-5 h-5", collapsed && "w-5 h-5")} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className={cn(
        "border-t border-border p-4",
        collapsed && "px-2"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
