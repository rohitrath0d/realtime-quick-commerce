import { useEffect } from 'react';
import { subscribeToEvent, SocketEvents } from '@/services/socket';
import { Order } from '@/services/api';

export const useOrderSocket = (
  onOrderCreated?: (order: Order) => void,
  onOrderUpdate?: (order: Order) => void,
  onOrderListUpdate?: (orders: Order[]) => void,
  onOrderStatusUpdated?: (data: { orderId: string; status: string }) => void
) => {
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    if (onOrderCreated) {
      unsubscribers.push(subscribeToEvent<Order>('order_created', onOrderCreated));
    }

    if (onOrderUpdate) {
      unsubscribers.push(subscribeToEvent<Order>('order_update', onOrderUpdate));
    }

    if (onOrderListUpdate) {
      unsubscribers.push(subscribeToEvent<Order[]>('order_list_update', onOrderListUpdate));
    }

    if (onOrderStatusUpdated) {
      unsubscribers.push(
        subscribeToEvent<{ orderId: string; status: string }>('order_status_updated', onOrderStatusUpdated)
      );
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [onOrderCreated, onOrderUpdate, onOrderListUpdate, onOrderStatusUpdated]);
};
