/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Search, 
  // Filter, 
  RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import OrderCard from "@/components/shared/OrderCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { adminApi, Order } from "@/services/api";
import { useOrderSocket } from "@/hooks/useSocketEvents";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "PLACED" | "STORE_ACCEPTED" | "PACKING" | "PACKED" | "PICKED_UP" | "ON_THE_WAY" | "DELIVERED";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "PLACED", label: "Placed" },
  { value: "STORE_ACCEPTED", label: "Accepted" },
  { value: "PACKING", label: "Packing" },
  { value: "PACKED", label: "Packed" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "ON_THE_WAY", label: "On The Way" },
  { value: "DELIVERED", label: "Delivered" },
];

const mapStatus = (status: string) => {
  const map: Record<string, string> = {
    PLACED: "pending",
    STORE_ACCEPTED: "confirmed",
    PACKING: "packing",
    PACKED: "packed",
    PICKED_UP: "picked",
    ON_THE_WAY: "transit",
    DELIVERED: "delivered",
  };
  return map[status] || "pending";
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllOrders();
      setOrders(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Socket events
  useOrderSocket(
    (newOrder) => setOrders((prev) => [newOrder, ...prev]),
    (updatedOrder) => setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))),
    (ordersList) => setOrders(ordersList)
  );

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order._id.toLowerCase().includes(search.toLowerCase()) ||
      (typeof order.customer !== 'string' && order.customer?.name?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">All Orders</h1>
          <p className="text-muted-foreground">Manage and track all orders</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchOrders} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search orders by ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              statusFilter === filter.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {filter.label}
            {filter.value === "all" && ` (${orders.length})`}
            {filter.value !== "all" && ` (${orders.filter(o => o.status === filter.value).length})`}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => (
          <div key={order._id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">#{order._id.slice(-8)}</p>
                <h3 className="font-semibold text-foreground">
                  {typeof order.customer !== 'string' ? order.customer?.name : 'Customer'}
                </h3>
              </div>
              <StatusBadge status={mapStatus(order.status) as any} />
            </div>
            
            <div className="space-y-2 mb-3">
              {order.items.slice(0, 2).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.qty}x {item.name}</span>
                  <span className="text-foreground">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              {order.items.length > 2 && (
                <p className="text-sm text-muted-foreground">+{order.items.length - 2} more items</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
              </span>
              <span className="text-lg font-bold text-primary">${order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
