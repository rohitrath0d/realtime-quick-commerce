"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  CheckCircle2,
  Clock,
  Box,
  RefreshCw,
  PackageCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/shared/StatsCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { storeApi, Order } from "@/services/api";
import { useOrderSocket } from "@/hooks/useSocketEvents";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type TabType = "pending" | "processing" | "ready" | "all";

const StoreOrdersPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      // const data = await storeApi.getStoreOrders();
      const data = await storeApi.getAllStoreOrders();
      setOrders(data.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Socket events
  useOrderSocket(
    () => {
      fetchOrders();
      toast.success("New order received!");
    },
    (updatedOrder) => {
      if (!["PLACED", "STORE_ACCEPTED", "PACKING", "PACKED"].includes(updatedOrder.status)) {
        setOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
        return;
      }
      setOrders((prev) => {
        const exists = prev.some((o) => o._id === updatedOrder._id);
        return exists
          ? prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
          : prev;
      });
    }
  );

  const handleAcceptOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const updated = await storeApi.acceptOrder(orderId);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      toast.success("Order accepted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartPacking = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const updated = await storeApi.startPacking(orderId);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      toast.success("Started packing order!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start packing");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPacked = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const updated = await storeApi.markAsPacked(orderId);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      toast.success("Order marked as packed!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark as packed");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter orders by tab
  const pendingOrders = orders.filter((o) => o.status === "PLACED");
  const processingOrders = orders.filter((o) => ["STORE_ACCEPTED", "PACKING"].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === "PACKED");

  const getOrdersForTab = () => {
    switch (activeTab) {
      case "all":
        return orders;
      case "pending":
        return pendingOrders;
      case "processing":
        return processingOrders;
      case "ready":
        return readyOrders;
      default:
        return [];
    }
  };

  const tabs = [
    { id: "pending" as TabType, label: "New Orders", count: pendingOrders.length, icon: Clock },
    { id: "processing" as TabType, label: "Processing", count: processingOrders.length, icon: Package },
    { id: "ready" as TabType, label: "Ready for Pickup", count: readyOrders.length, icon: CheckCircle2 },
    { id: "all" as TabType, label: "All Orders", count: orders.length, icon: Package },
  ];

  const getActionButton = (order: Order) => {
    const isLoading = actionLoading === order._id;

    switch (order.status) {
      case "PLACED":
        return (
          <Button
            size="sm"
            onClick={() => handleAcceptOrder(order._id)}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Accept Order
          </Button>
        );
      case "STORE_ACCEPTED":
        return (
          <Button
            size="sm"
            onClick={() => handleStartPacking(order._id)}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Box className="w-4 h-4" />}
            Start Packing
          </Button>
        );
      case "PACKING":
        return (
          <Button
            size="sm"
            onClick={() => handleMarkPacked(order._id)}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
            Mark as Packed
          </Button>
        );
      case "PACKED":
        return (
          <span className="text-sm text-green-600 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Ready for Pickup
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Order Management</h1>
          <p className="text-muted-foreground">Manage incoming orders for your store</p>
        </div>

        <Button variant="outline" className="gap-2" onClick={fetchOrders} disabled={isLoading}>
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="New Orders"
          value={pendingOrders.length}
          icon={Clock}
          change="Pending"
          changeType="neutral"
        />
        <StatsCard
          title="Processing"
          value={processingOrders.length}
          icon={Package}
          change="In Progress"
          changeType="neutral"
        />
        <StatsCard
          title="Ready for Pickup"
          value={readyOrders.length}
          icon={CheckCircle2}
          change="Completed"
          changeType="positive"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                activeTab === tab.id
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : getOrdersForTab().length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No orders in this category</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Orders will appear here when customers place them
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {getOrdersForTab().map((order) => (
            <div
              key={order._id}
              className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                          {item.name} × {item.qty}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {/* <p className="text-lg font-bold">${order.total.toFixed(2)}</p> */}
                    <p className="text-lg font-bold">${order.total ? order.total.toFixed(2) : '0.00'}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ''}
                    </p>
                  </div>

                  {getActionButton(order)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreOrdersPage;
