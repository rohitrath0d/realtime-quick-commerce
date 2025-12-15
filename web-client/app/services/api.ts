import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to requests
api.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore in SSR
  }
  return config;
});

// Response error normalization: attach status to thrown Error for callers to react accordingly
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message || 'API Error';
      const err = new Error(message) as Error & { status?: number };
      err.status = status;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);

// Simple response handler
const handleData = <T>(res: { data: T }) => res.data;

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }).then(handleData),
  register: (data: { name: string; email: string; password: string; role: string; phone?: string }) =>
    api.post('/auth/register', data).then(handleData),
  getProfile: () => api.get('/auth/profile').then(handleData),
};

// Customer
export const customerApi = {
  // return orders array directly
  getMyOrders: () => api.get('/orders/my').then((res) => res.data.data),
  getOrderById: (id: string) => api.get(`/orders/${id}`).then(handleData),
  placeOrder: (data: PlaceOrderData) => api.post('/orders', data).then(handleData),
};

// Store
export const storeApi = {
  // return orders array directly
  getStoreOrders: () => api.get('/store/orders').then((res) => res.data.data),
  acceptOrder: (id: string) => api.post(`/store/orders/${id}/accept`).then(handleData),
  startPacking: (id: string) => api.post(`/store/orders/${id}/packing`).then(handleData),
  markAsPacked: (id: string) => api.post(`/store/orders/${id}/packed`).then(handleData),
  createStore: (data: CreateStoreData) => api.post('/store', data).then(handleData),
  deleteStore: (id: string) => api.delete(`/store/${id}`).then(handleData),
};

// Delivery
export const deliveryApi = {
  getUnassignedOrders: () => api.get('/delivery/orders/unassigned').then((res) => res.data.data),
  getMyOrders: () => api.get('/delivery/orders/my').then((res) => res.data.data),
  acceptOrder: (id: string) => api.post(`/delivery/orders/${id}/accept`).then(handleData),
  updateStatus: (id: string, status: string) => api.post(`/delivery/orders/${id}/status`, { status }).then(handleData),
};

// Admin
export const adminApi = {
  // getAllOrders: (status?: string) => api.get(`/admin/orders${status ? `?status=${status}` : ''}`).then((res) => res.data.data),
  // getDeliveryPartners: () => api.get('/admin/delivery-partners').then(handleData),
  // getStats: () => api.get('/admin/live-stats').then(handleData),
  // deleteStore: (id: string) => api.delete(`/admin/stores/${id}`).then(handleData),

  getAllOrders: (status?: string) =>
    api
      .get(`/admin/orders${status ? `?status=${status}` : ""}`)
      .then((res) => res.data.data as Order[]),

  getDeliveryPartners: () =>
    api
      .get("/admin/delivery-partners")
      .then((res) => res.data.data as DeliveryPartner[]),

  getStats: () =>
    api
      .get("/admin/live-stats")
      .then((res) => res.data as AdminStats),

  deleteStore: (id: string) =>
    api.delete(`/admin/stores/${id}`).then((res) => res.data),

};

// Products (public)
export const productApi = {
  // Returns array of products
  getPublicProducts: () => api.get('/product/public').then((res) => res.data.data),
};

// Types
export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'store' | 'delivery' | 'admin';
  phone?: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  qty: number;
  price: number;
};

export type OrderStatus =
  | 'PLACED'
  | 'STORE_ACCEPTED'
  | 'PACKING'
  | 'PACKED'
  | 'PICKED_UP'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'CANCELLED';

export type Order = {
  _id: string;
  customer: Partial<User> | string;
  store: { _id: string; name?: string } | string;
  deliveryPartner?: Partial<User> | string | null;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  lockedAt?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PlaceOrderData = {
  items: { productId: string; quantity: number }[];
  address?: string;
};

export type DeliveryPartner = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
};

export type AdminStats = {
  totalOrders: number;
  placed: number;
  packed: number;
  delivered: number;
};

export type CreateStoreData = {
  name: string;
  address: string;
};

export default api;
