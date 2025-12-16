"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, MapPin, CheckCircle2, Clock, Truck, Navigation, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/shared/StatsCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { deliveryApi, Order, OrderStatus } from "@/services/api";
import { useOrderSocket } from "@/hooks/useSocketEvents";
import { cn } from "@/lib/utils";
import Unauthorized from '@/components/Unauthorized';
// import { toast } from "@/hooks/use-toast";
import { toast } from "sonner";

type UIOrderStatus = "pending" | "confirmed" | "packing" | "packed" | "picked" | "transit" | "delivered";

const DeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState<"available" | "active">("available");
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<{ totalEarnings: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      // const [unassigned, assigned] = await Promise.all([
      const [unassigned, assigned, statsRes] = await Promise.all([
        deliveryApi.getUnassignedOrders(),      // res.data.data
        deliveryApi.getMyOrders(),              // res.data.data
        deliveryApi.getStats(),
      ]);
      console.log("Assigned orders--> ", assigned);
      console.log("Unassigned orders--> ", unassigned);
      setAvailableOrders(unassigned);
      console.log("Assigned orders after set--> ", assigned);
      setMyOrders(assigned);
      setStats((statsRes as any)?.data || null);
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err?.status === 403 || err?.status === 404) {
        setUnauthorized(true);
        return;
      }

      // toast({
      //   title: "Failed to load orders",
      //   description: error instanceof Error ? error.message : "Please try again",
      //   variant: "destructive",
      // });

      toast.error(
        error instanceof Error ? error.message : "Failed to load orders. Please try again"
      )

    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Socket events (map backend statuses)
  useOrderSocket(
    (newOrder) => {
      if (newOrder.status === "PACKED") {
        setAvailableOrders((prev) => [newOrder, ...prev]);
      }
    },
    (updatedOrder) => {
      setAvailableOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
      setMyOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    }
  );

  const acceptOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const updated = await deliveryApi.acceptOrder(orderId);
      setAvailableOrders((prev) => prev.filter((o) => o._id !== orderId));
      setMyOrders((prev) => [updated, ...prev]);
      // toast({
      //   title: "Order Accepted! 🎉",
      //   description: `Order #${updated.orderId || updated._id} has been assigned to you.`,
      // });
      toast.success(`Order #${updated.orderId || updated._id} has been assigned to you. 🎉`);
    } catch (error) {
      // toast({
      //   title: "Failed to accept order",
      //   description: error instanceof Error ? error.message : "Please try again",
      //   variant: "destructive",
      // });
      toast.error(
        error instanceof Error ? error.message : "Failed to accept order. Please try again"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      const updated = await deliveryApi.updateStatus(orderId, newStatus);
      setMyOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o))
      );

      const statusMessages: Record<string, string> = {
        picked: "Order picked up",
        transit: "On the way to customer",
        delivered: "Order delivered successfully!",
      };

      // toast({
      //   title: statusMessages[newStatus] || "Status updated",
      //   description: `Order #${updated.orderId || updated._id} status updated.`,
      // });
      toast.success(
        statusMessages[newStatus] || "Status updated"
        + ` for Order #${updated.orderId || updated._id}.`
      )
    } catch (error) {

      // toast({
      //   title: "Failed to update status",
      //   description: error instanceof Error ? error.message : "Please try again",
      //   variant: "destructive",
      // });
      toast.error(
        error instanceof Error ? error.message : "Failed to update status. Please try again"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getNextStatus = (currentStatus?: OrderStatus): OrderStatus | null => {
    const flow: Partial<Record<OrderStatus, OrderStatus>> = {
      PACKED: 'PICKED_UP',
      PICKED_UP: 'ON_THE_WAY',
      ON_THE_WAY: 'DELIVERED',
    };
    if (!currentStatus) return null;
    console.log('Status flow check:', currentStatus, '->', flow[currentStatus]);
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

  const mapToUiStatus = (s?: OrderStatus): UIOrderStatus | 'cancelled' => {
    switch (s) {
      case 'PLACED':
        return 'pending';
      case 'STORE_ACCEPTED':
        return 'confirmed';
      case 'PACKING':
        return 'packing';
      case 'PACKED':
        return 'packed';
      case 'PICKED_UP':
        return 'picked';
      case 'ON_THE_WAY':
        return 'transit';
      case 'DELIVERED':
        return 'delivered';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  console.log(myOrders, 'My Orders');

  const activeDeliveries = myOrders.filter((o) => mapToUiStatus(o.status) !== 'delivered');
  // const completedToday = myOrders.filter((o) => mapToUiStatus(o.status) === 'delivered').length;
  const completedToday = stats?.completed || 0;
  const earnings = typeof stats?.totalEarnings === 'number' ? stats.totalEarnings : 0;

  console.log(activeDeliveries, 'Active Deliveries');

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
    return <Unauthorized userRole="delivery" />;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Delivery Dashboard</h1>
          <p className="text-muted-foreground">Manage your deliveries efficiently</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchOrders} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
          <StatsCard
            title="Active Orders"
            value={activeDeliveries.length}
            icon={Package}
          />
        </div>
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
          <StatsCard
            // title="Completed Today"
            title="Total Completed"
            value={completedToday}
            icon={CheckCircle2}
          />
        </div>
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
          <StatsCard
            title="Available"
            value={availableOrders.length}
            icon={Clock}
          />
        </div>
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.35s" }}>
          <StatsCard
            title="Earnings"
            // value={`$${(completedToday * 5).toFixed(0)}`}
            value={`$${earnings.toFixed(0)}`}
            icon={Truck}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 animate-fade-up opacity-0" style={{ animationDelay: "0.4s" }}>
        <button
          onClick={() => setActiveTab("available")}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium transition-all duration-300",
            activeTab === "available"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          Available ({availableOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium transition-all duration-300",
            activeTab === "active"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          My Deliveries ({activeDeliveries.length})
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {activeTab === "available" &&
          availableOrders.map((order, index) => {
            const orderId = order?._id || order?.orderId || '';
            return (
              <div
                // key={order._id}
                key={orderId || `idx-${index}`}
                className="glass-card rounded-2xl p-5 animate-fade-up opacity-0"
                style={{ animationDelay: `${0.45 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {/* <span className="text-sm text-muted-foreground">#{order._id}</span> */}
                    <span className="text-sm text-muted-foreground">#{orderId || '--------'}</span>
                    <h3 className="font-semibold text-foreground">{typeof order.customer === 'string' ? 'Customer' : order.customer?.name || 'Customer'}</h3>
                  </div>
                  <span className="text-xl font-bold text-primary">${order.total ? order.total.toFixed(2) : "0.00"}</span>
                </div>

                <div className="flex items-start gap-2 mb-4 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                  <span>{typeof order.store === 'string' ? 'Store' : order.store?.name || 'Store'}</span>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{order.items.length} items</span>
                </div>

                <Button
                  variant="accent"
                  className="w-full"
                  // onClick={() => acceptOrder(order._id)}
                  // disabled={actionLoading === order._id}
                  onClick={() => orderId && acceptOrder(orderId)}
                  disabled={!orderId || actionLoading === orderId}
                >
                  {/* {actionLoading === order._id ? ( */}
                  {actionLoading === orderId ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Accept Order"
                  )}
                </Button>
              </div>
            );
          })}


        {activeTab === "active" &&
          activeDeliveries.map((order, index) => {
            // const nextStatus = getNextStatus(order.status as OrderStatus);
            const orderId = order?._id || order?.orderId || '';
            const nextStatus = getNextStatus(order?.status as OrderStatus | undefined)

            return (
              <div
                // key={order._id}
                key={orderId || `idx-${index}`}
                className="glass-card rounded-2xl p-5 animate-fade-up opacity-0"
                style={{ animationDelay: `${0.45 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">#{orderId || '--------'}</span>
                      <StatusBadge status={mapToUiStatus(order?.status as OrderStatus | undefined)} pulse={mapToUiStatus(order?.status as OrderStatus | undefined) === 'transit'} />
                    </div>
                    <h3 className="font-semibold text-foreground">{typeof order.customer === 'string' ? 'Customer' : order.customer?.name || 'Customer'}</h3>
                  </div>
                  {/* <span className="text-xl font-bold text-primary">${order.total.toFixed(2)}</span> */}
                  <span className="text-xl font-bold text-primary">${order.total ? order.total.toFixed(2) : '0.00'}</span>
                </div>

                <div className="flex items-start gap-2 mb-4 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                  <span>{typeof order.store === 'string' ? 'Store' : order.store?.name || 'Store'}</span>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {/* {order.items.map((i: { name: string; qty: number }) => `${i.qty}x ${i.name}`).join(", ")} */}
                    {(order.items ?? []).map((i: { name: string; qty: number }) => `${i.qty}x ${i.name}`).join(", ")}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Navigation className="w-4 h-4" />
                    Navigate
                  </Button>
                  {nextStatus && (
                    <Button
                      variant={mapToUiStatus(order?.status as OrderStatus | undefined) === 'transit' ? 'success' : 'accent'}
                      size="sm"
                      className="flex-1"
                      // onClick={() => updateStatus(order._id, nextStatus)}
                      // disabled={actionLoading === order._id}
                      onClick={() => orderId && updateStatus(orderId, nextStatus)}
                      disabled={!orderId || actionLoading === orderId}
                    >
                      {/* {actionLoading === order._id ? ( */}
                      {actionLoading === orderId ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        getActionLabel(order.status as OrderStatus)
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Empty States */}
      {activeTab === "available" && availableOrders.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No available orders</h3>
          <p className="text-muted-foreground">New orders will appear here when ready for pickup</p>
        </div>
      )}

      {activeTab === "active" && activeDeliveries.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <Truck className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No active deliveries</h3>
          <p className="text-muted-foreground">Accept orders to start delivering</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
