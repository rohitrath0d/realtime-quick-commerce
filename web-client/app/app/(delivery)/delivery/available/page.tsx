"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, MapPin, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deliveryApi, Order } from "@/services/api";
import { useOrderSocket } from "@/hooks/useSocketEvents";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const AvailableOrdersPage = () => {
  const router = useRouter();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await deliveryApi.getUnassignedOrders();
      setAvailableOrders(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useOrderSocket(
    (newOrder) => {
      if (newOrder.status === "PACKED") {
        setAvailableOrders((prev) => [newOrder, ...prev]);
      }
    },
    (updatedOrder) => {
      // Remove from available if it's been picked up
      if (updatedOrder.deliveryPartner) {
        setAvailableOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
      }
    }
  );

  const acceptOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await deliveryApi.acceptOrder(orderId);
      setAvailableOrders((prev) => prev.filter((o) => o._id !== orderId));
      toast.success("Order accepted! Check My Orders to manage delivery.");
      router.push("/delivery/my-orders");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept order");
    } finally {
      setActionLoading(null);
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground mb-1">Available Orders</h1>
          <p className="text-muted-foreground">Orders ready for pickup</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchOrders} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{availableOrders.length}</p>
            <p className="text-sm text-muted-foreground">Orders waiting for pickup</p>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableOrders.map((order) => (
          <div key={order._id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-sm text-muted-foreground">#{order._id.slice(-8)}</span>
                <h3 className="font-semibold text-foreground">
                  {typeof order.customer !== 'string' ? order.customer?.name : 'Customer'}
                </h3>
              </div>
              <span className="text-xl font-bold text-primary">${order.total.toFixed(2)}</span>
            </div>

            <div className="flex items-start gap-2 mb-4 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
              <span>{typeof order.store !== 'string' ? order.store?.name : 'Store'}</span>
            </div>

            <div className="flex items-center gap-2 mb-4 text-sm">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{order.items.length} items</span>
            </div>

            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}
              </span>
            </div>

            <Button
              className="w-full gap-2"
              onClick={() => acceptOrder(order._id)}
              disabled={actionLoading === order._id}
            >
              {actionLoading === order._id ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Accept Order"
              )}
            </Button>
          </div>
        ))}
      </div>

      {availableOrders.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No available orders</h3>
          <p className="text-muted-foreground">New orders will appear here when they&apos;re ready for pickup</p>
        </div>
      )}
    </div>
  );
};

export default AvailableOrdersPage;
