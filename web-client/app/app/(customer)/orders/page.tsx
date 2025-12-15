"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Package } from "lucide-react";
// import { Link } from "react-router-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import OrderCard from "@/components/shared/OrderCard";
import OrderTracker from "@/components/shared/OrderTracker";
import { customerApi, Order } from "@/services/api";
import { cn } from "@/lib/utils";
import Unauthorized from '@/components/Unauthorized';
import { useOrderSocket } from "@/hooks/useSocketEvents";
import { useAuth } from '@/providers/AuthProvider';

const CustomerOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    customerApi
      .getMyOrders()
      .then((data) => {
        if (!mounted) return;
        setCustomerOrders(data || []);
      })
      .catch((err) => {
        const error = err as Error & { status?: number };
        if (error?.status === 403 || error?.status === 404) {
          setUnauthorized(true);
          return;
        }
        console.error(err);
      })
      .finally(() => setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  // Socket updates: keep list fresh
  const { user } = useAuth();

  useOrderSocket(
    (newOrder) => {
      // only prepend orders that belong to this customer
      const customerId = typeof newOrder.customer === 'string' ? newOrder.customer : (newOrder.customer as any)?._id;
      if (customerId === user?._id) {
        setCustomerOrders((s) => [newOrder, ...s]);
      }
    }, // order_created
    (updatedOrder) => {
      const customerId = typeof updatedOrder.customer === 'string' ? updatedOrder.customer : (updatedOrder.customer as any)?._id;
      if (customerId === user?._id) {
        setCustomerOrders((s) => s.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
      }
    }, // order_update
    (list) => setCustomerOrders(list.filter((o) => (typeof o.customer === 'string' ? o.customer === user?._id : (o.customer as any)?._id === user?._id))) // order_list_update
  );

  if (unauthorized) {
    return <Unauthorized userRole="customer" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
        {/* <Link to="/customer"> */}
        <Link href="/customer">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="text-sm text-muted-foreground">Track your deliveries in real-time</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Orders List */}
        <div className="space-y-4">
          {isLoading && <div className="py-8 text-center">Loading...</div>}
          {customerOrders.map((order, index) => (
            <div
              key={order._id}
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <OrderCard
                id={order._id}
                customerName={typeof order.customer === 'string' ? undefined : order.customer?.name}
                items={order.items.map((i) => ({ name: i.name, quantity: i.qty }))}
                address={typeof order.store === 'string' ? 'Store' : order.store?.name || 'Store'}
                status={
                  // map backend status to UI-friendly status string
                  (order.status === 'PACKED'
                    ? 'packed'
                    : order.status === 'PACKING'
                    ? 'packing'
                    : order.status === 'PICKED_UP'
                    ? 'picked'
                    : order.status === 'ON_THE_WAY'
                    ? 'transit'
                    : order.status === 'DELIVERED'
                    ? 'delivered'
                    : 'pending') as any
                }
                time={order.createdAt || ''}
                total={order.total}
                onClick={() => setSelectedOrder(order)}
                className={cn((selectedOrder?._id || selectedOrder?._id) === order._id && 'ring-2 ring-primary')}
              />
            </div>
          ))}

          {customerOrders.length === 0 && !isLoading && (
            <div className="text-center py-16 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
              <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start ordering to see your orders here</p>
              {/* <Link to="/customer"> */}
              <Link href="/customer">
                <Button variant="accent">Browse Products</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <div className="lg:sticky lg:top-24 h-fit animate-slide-in-right">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Order #{selectedOrder._id}</h2>
                  <p className="text-sm text-muted-foreground">{selectedOrder.createdAt}</p>
                </div>
                <span className="text-2xl font-bold text-primary">${selectedOrder.total.toFixed(2)}</span>
              </div>

              {/* Tracker */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Delivery Status</h3>
                <OrderTracker currentStatus={selectedOrder.status as any} />
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: { name: string; qty: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <span className="text-foreground">{item.name}</span>
                      <span className="text-muted-foreground">x{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Delivery Address</h3>
                <p className="text-foreground">{typeof selectedOrder.store === 'string' ? 'Store' : selectedOrder.store?.name || 'Store'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;