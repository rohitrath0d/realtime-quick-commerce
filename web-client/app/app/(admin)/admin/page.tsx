"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Truck,
  DollarSign,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Star,
  Phone,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/shared/StatsCard";
import OrderCard from "@/components/shared/OrderCard";
import { adminApi, Order, DeliveryPartner, AdminStats } from "@/services/api";
import { useOrderSocket } from "@/hooks/useSocketEvents";
import { cn } from "@/lib/utils";
// import { toast } from "@/hooks/use-toast";
import { toast } from "sonner";


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "partners">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [ordersData, partnersData, statsData] = await Promise.all([
        adminApi.getAllOrders(),
        adminApi.getDeliveryPartners(),
        adminApi.getStats(),
      ]);
      console.log("Order's data for Admin-->", ordersData);
      console.log("Delivery Partner's data for admin-->", partnersData);
      console.log("Stats data for admin-->", statsData);

      setOrders(ordersData);
      setPartners(partnersData);
      setStats(statsData);
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err?.status === 403 || err?.status === 404) {
        setUnauthorized(true);
        return;
      }
      // toast({
      //   title: "Failed to load data",
      //   description: error instanceof Error ? error.message : "Please try again",
      //   variant: "destructive",
      // });
      toast.error(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Socket events for real-time updates
  useOrderSocket(
    (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    },
    (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    },
    (ordersList) => {
      setOrders(ordersList);
    }
  );

  const formatOrderForCard = (order: Order) => ({
    id: order.orderId || order._id,
    customerName: order.customer?.name || "Unknown",
    items: order.items,
    address: order.address,
    status: order.status,
    time: new Date(order.createdAt).toLocaleString(),
    total: order.total,
  });

  const orderStats = {
    pending: orders.filter((o) => o.status === "pending").length,
    inProgress: orders.filter((o) =>
      ["confirmed", "packing", "packed", "picked", "transit"].includes(o.status)
    ).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };



  // Calculate active partners count safely
  const activePartnersCount = Array.isArray(partners)
    ? partners.filter((p) => p.status === "active").length
    : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return <div className="container mx-auto px-4 py-8"><h2 className="text-2xl font-bold">Unauthorized</h2><p className="text-muted-foreground">You don't have access to admin resources.</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor all operations in real-time</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.15s" }}>
          <StatsCard
            title="Total Orders"
            value={stats?.totalOrders || orders.length}
            icon={Package}
          />
        </div>
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
          <StatsCard
            title="Active Partners"
            // value={stats?.activePartners || partners.filter((p) => p.status === "active").length}
            value={stats?.activePartners || activePartnersCount}
            icon={Truck}
          />
        </div>
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
          <StatsCard
            title="Revenue"
            value={`$${(stats?.totalRevenue || orders.reduce((sum, o) => sum + o.total, 0)).toFixed(0)}`}
            icon={DollarSign}
          />
        </div>
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
          <StatsCard
            title="Avg. Delivery"
            value={stats?.avgDeliveryTime || "N/A"}
            icon={Clock}
          />
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.35s" }}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Order Status Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-warning/10">
            <AlertCircle className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{orderStats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-primary/10">
            <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{orderStats.inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-success/10">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{orderStats.delivered}</p>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 animate-fade-up opacity-0" style={{ animationDelay: "0.4s" }}>
        <button
          onClick={() => setActiveTab("orders")}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2",
            activeTab === "orders"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <Package className="w-4 h-4" />
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("partners")}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2",
            activeTab === "partners"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <Users className="w-4 h-4" />
          Delivery Partners ({partners.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "orders" && (
        <div className="grid md:grid-cols-2 gap-4">
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <div
                key={order._id}
                className="animate-fade-up opacity-0"
                style={{ animationDelay: `${0.45 + index * 0.05}s` }}
              >
                <OrderCard {...formatOrderForCard(order)} showCustomer />
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-16">
              <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground">Orders will appear here when placed</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "partners" && (
        <div className="grid md:grid-cols-2 gap-4">
          {partners.length > 0 ? (
            partners.map((partner, index) => (
              <div
                key={partner._id}
                className="glass-card rounded-2xl p-5 animate-fade-up opacity-0"
                style={{ animationDelay: `${0.45 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{partner.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {partner.phone || partner.email}
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      partner.status === "active"
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {partner.status === "active" ? "Active" : "Idle"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-lg font-bold text-foreground">{partner.activeOrders}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-lg font-bold text-foreground">{partner.completedToday}</p>
                    <p className="text-xs text-muted-foreground">Today</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <p className="text-lg font-bold text-foreground">{partner.rating}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No delivery partners</h3>
              <p className="text-muted-foreground">Partners will appear here when registered</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
