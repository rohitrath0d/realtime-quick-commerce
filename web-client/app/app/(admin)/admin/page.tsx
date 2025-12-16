"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Truck,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/shared/StatsCard";
import { adminApi, Order, DeliveryPartner, AdminStats } from "@/services/api";
import { useOrderSocket } from "@/hooks/useSocketEvents";
import { toast } from "sonner";

// Simple chart component for order status distribution
const OrderStatusChart = ({ stats }: { stats: { pending: number; inProgress: number; delivered: number } }) => {
  const total = stats.pending + stats.inProgress + stats.delivered;
  const pendingPercent = total > 0 ? (stats.pending / total) * 100 : 0;
  const inProgressPercent = total > 0 ? (stats.inProgress / total) * 100 : 0;
  const deliveredPercent = total > 0 ? (stats.delivered / total) * 100 : 0;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Order Distribution</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-medium text-warning">{stats.pending}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-warning rounded-full transition-all duration-500"
              style={{ width: `${pendingPercent}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">In Progress</span>
            <span className="font-medium text-primary">{stats.inProgress}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${inProgressPercent}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Delivered</span>
            <span className="font-medium text-success">{stats.delivered}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${deliveredPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Revenue trend chart (bar chart simulation)
const RevenueTrendChart = ({ orders }: { orders: Order[] }) => {
  // Group orders by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const revenueByDay = last7Days.map(day => {
    const dayOrders = orders.filter(o => 
      o.createdAt && o.createdAt.split('T')[0] === day
    );
    return dayOrders.reduce((sum, o) => sum + o.total, 0);
  });

  const maxRevenue = Math.max(...revenueByDay, 1);

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend (7 Days)</h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {revenueByDay.map((revenue, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-1">
                ${revenue.toFixed(0)}
              </span>
              <div 
                className="w-full bg-linear-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-500"
                style={{ height: `${(revenue / maxRevenue) * 80}px`, minHeight: '4px' }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(last7Days[index]).toLocaleDateString('en', { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Donut chart for partner status
const PartnerStatusChart = ({ partners }: { partners: DeliveryPartner[] }) => {
  const active = partners.filter(p => p.status === 'active').length;
  const idle = partners.length - active;
  const total = partners.length || 1;
  const activePercent = (active / total) * 100;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Partner Status</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${activePercent * 2.51} 251`}
              className="text-success transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{total}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Active: {active}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-sm text-muted-foreground">Idle: {idle}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
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

      setOrders(ordersData);
      setPartners(partnersData);
      setStats(statsData);
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err?.status === 403 || err?.status === 404) {
        setUnauthorized(true);
        return;
      }
      toast.error(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const orderStats = {
    pending: orders.filter((o) => o.status === "PLACED").length,
    inProgress: orders.filter((o) =>
      ["STORE_ACCEPTED", "PACKING", "PACKED", "PICKED_UP", "ON_THE_WAY"].includes(o.status)
    ).length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
  };

  const activePartnersCount = Array.isArray(partners)
    ? partners.filter((p) => p.status === "active").length
    : 0;

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Calculate trend (mock - comparing with previous period)
  const previousRevenue = totalRevenue * 0.85; // Mock previous period
  const revenueTrend = totalRevenue > previousRevenue;
  const trendPercent = previousRevenue > 0 
    ? Math.abs(((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div>
        <h2 className="text-2xl font-bold">Unauthorized</h2>
        <p className="text-muted-foreground">You don&apos;t have access to admin resources.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor all operations in real-time</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || orders.length}
          icon={Package}
        />
        <StatsCard
          title="Active Partners"
          value={stats?.activePartners || activePartnersCount}
          icon={Truck}
        />
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(0)}</p>
          <div className="flex items-center gap-1 mt-1">
            {revenueTrend ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span className={`text-xs ${revenueTrend ? 'text-success' : 'text-destructive'}`}>
              {trendPercent}% vs last period
            </span>
          </div>
        </div>
        <StatsCard
          title="Avg. Delivery"
          value={stats?.avgDeliveryTime || "~15 min"}
          icon={Clock}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <OrderStatusChart stats={orderStats} />
        <RevenueTrendChart orders={orders} />
        <PartnerStatusChart partners={partners} />
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 text-center">
          <Package className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{orderStats.pending}</p>
          <p className="text-sm text-muted-foreground">Pending Orders</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{orderStats.inProgress}</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <Store className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{orderStats.delivered}</p>
          <p className="text-sm text-muted-foreground">Delivered Today</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
