import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

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
    return () => {};
  }

  socket.on(event, callback);
  return () => {
    socket?.off(event, callback);
  };
};
