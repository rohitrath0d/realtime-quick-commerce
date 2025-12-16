import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

const base64UrlDecode = (value: string): string => {
  // Convert base64url -> base64
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  // Pad to length multiple of 4
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
};

const getUserIdFromJwt = (token: string): string | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson) as { id?: string; _id?: string; sub?: string };
    return payload.id || payload._id || payload.sub || null;
  } catch {
    return null;
  }
};

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);

    // Join user-specific room so server can emit targeted events.
    const userId = getUserIdFromJwt(token);
    if (userId) {
      socket?.emit('join_room', `user_${userId}`);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

// Socket event types
export type SocketEvents =
  | 'order_created'
  | 'order_update'
  | 'order_list_update'
  | 'order_status_updated';

export const subscribeToEvent = <T>(
  event: SocketEvents,
  callback: (data: T) => void
): (() => void) => {
  if (!socket) {
    console.warn('Socket not connected');
    return () => { };
  }

  socket.on(event, callback);
  return () => {
    socket?.off(event, callback);
  };
};
