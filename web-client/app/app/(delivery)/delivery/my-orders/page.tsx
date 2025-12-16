"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, MapPin, Navigation, RefreshCw, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import { deliveryApi, Order, OrderStatus } from "@/services/api";
import { useOrderSocket } from "@/hooks/useSocketEvents";
import { toast } from "sonner";

type UIOrderStatus = "pending" | "confirmed" | "packing" | "packed" | "picked" | "transit" | "delivered";

const MyOrdersPage = () => {
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await deliveryApi.getMyOrders();
      setMyOrders(data);
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
    undefined,
    (updatedOrder) => {
      setMyOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    }
  );

  const updateStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      const updated = await deliveryApi.updateStatus(orderId, newStatus);
      setMyOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o))
      );
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: Partial<Record<OrderStatus, OrderStatus>> = {
      PACKED: 'PICKED_UP',
      PICKED_UP: 'ON_THE_WAY',
      ON_THE_WAY: 'DELIVERED',
    };
    return flow[currentStatus] || null;
  };

  const getActionLabel = (status: OrderStatus): string => {
    const labels: Partial<Record<OrderStatus, string>> = {
      PACKED: 'Mark as Picked Up',
      PICKED_UP: 'Start Delivery',
      ON_THE_WAY: 'Mark as Delivered',
    };
    return labels[status] || 'Update';
  };

  const mapToUiStatus = (s: OrderStatus): UIOrderStatus | 'cancelled' => {
    switch (s) {
      case 'PLACED': return 'pending';
      case 'STORE_ACCEPTED': return 'confirmed';
      case 'PACKING': return 'packing';
      case 'PACKED': return 'packed';
      case 'PICKED_UP': return 'picked';
      case 'ON_THE_WAY': return 'transit';
      case 'DELIVERED': return 'delivered';
      case 'CANCELLED': return 'cancelled';
      default: return 'pending';
    }
  };

  const activeDeliveries = myOrders.filter((o) => mapToUiStatus(o.status) !== 'delivered');
  const completedDeliveries = myOrders.filter((o) => mapToUiStatus(o.status) === 'delivered');

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
          <h1 className="text-3xl font-bold text-foreground mb-1">My Orders</h1>
          <p className="text-muted-foreground">Manage your assigned deliveries</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchOrders} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 text-center">
          <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{activeDeliveries.length}</p>
          <p className="text-sm text-muted-foreground">Active Deliveries</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{completedDeliveries.length}</p>
          <p className="text-sm text-muted-foreground">Completed Today</p>
        </div>
      </div>

      {/* Active Orders */}
      {activeDeliveries.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Active Deliveries</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {activeDeliveries.map((order) => {
              const nextStatus = getNextStatus(order.status as OrderStatus);

              return (
                <div key={order._id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">#{order._id.slice(-8)}</span>
                        <StatusBadge status={mapToUiStatus(order.status)} pulse={mapToUiStatus(order.status) === 'transit'} />
                      </div>
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
                    <span className="text-foreground">
                      {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Navigation className="w-4 h-4" />
                      Navigate
                    </Button>
                    {nextStatus && (
                      <Button
                        variant={mapToUiStatus(order.status) === 'transit' ? 'success' : 'default'}
                        size="sm"
                        className="flex-1"
                        onClick={() => updateStatus(order._id, nextStatus)}
                        disabled={actionLoading === order._id}
                      >
                        {actionLoading === order._id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          getActionLabel(order.status)
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Orders */}
      {completedDeliveries.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Completed Today</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedDeliveries.map((order) => (
              <div key={order._id} className="glass-card rounded-2xl p-5 opacity-75">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm text-muted-foreground">#{order._id.slice(-8)}</span>
                  <StatusBadge status="delivered" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {typeof order.customer !== 'string' ? order.customer?.name : 'Customer'}
                </h3>
                <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {myOrders.length === 0 && (
        <div className="text-center py-16">
          <Truck className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
          <p className="text-muted-foreground">Accept orders from the available tab to start delivering</p>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
