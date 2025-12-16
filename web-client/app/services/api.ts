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
    console.log("Token got from the localStorage-->", token);
    
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
      console.log(error); 
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
  getPublicProducts: () => api.get('/product/public').then((res) => res.data.data),
};

// Store
export const storeApi = {
  getStoreOrders: () =>
    api.get('/store/orders').then(res => res.data as { data: Order[]; storeExists: boolean; store?: any }),

  acceptOrder: (id: string) =>
    api.post(`/store/orders/${id}/accept`).then(res => res.data.data as Order),

  startPacking: (id: string) =>
    api.post(`/store/orders/${id}/packing`).then(res => res.data.data as Order),

  markAsPacked: (id: string) =>
    api.post(`/store/orders/${id}/packed`).then(res => res.data.data as Order),

  getStore: () =>
    api.get('/store').then(res => res.data as { exists: boolean; store?: any }),

  createStore: (data: CreateStoreData) => 
    api.post('/store', data).then(handleData),

  deleteStore: (id: string) => 
    api.delete(`/store/${id}`).then(handleData),

  // Product management
  getProducts: () =>
    api.get('/product').then(res => res.data.data),

  createProduct: (data: CreateProductData) =>
    api.post('/product', data).then(handleData),

  updateProduct: (id: string, data: Partial<CreateProductData>) =>
    api.put(`/product/${id}`, data).then(handleData),

  deleteProduct: (id: string) =>
    api.delete(`/product/${id}`).then(handleData),
};
// console.log("Get store orders--> ", storeApi.getStoreOrders);
// console.log("Get Accept Store orders--> ", storeApi.acceptOrder);
// console.log("Get Start Packing Store orders--> ", storeApi.startPacking);
// console.log("Get Mark As Packed Store orders--> ", storeApi.markAsPacked);


// Delivery
export const deliveryApi = {
  getUnassignedOrders: () => api.get('/delivery/orders/unassigned').then((res) => res.data.data),
  getMyOrders: () => api.get('/delivery/orders/my').then((res) => res.data.data),
  acceptOrder: (id: string) => api.post(`/delivery/orders/${id}/accept`).then(handleData),
  updateStatus: (id: string, status: string) => api.post(`/delivery/orders/${id}/status`, { status }).then(handleData),
};

// Admin
export const adminApi = {
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

  getAllStores: () =>
    api
      .get("/admin/stores")
      .then((res) => res.data.data),

  deleteStore: (id: string) =>
    api.delete(`/admin/stores/${id}`).then((res) => res.data),

};

// Payment
export const paymentApi = {
  createOrder: (amount: number, currency = 'INR') =>
    api.post('/payment/create-order', { amount, currency }).then(handleData),

  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post('/payment/verify', data).then(handleData),

  getPaymentDetails: (paymentId: string) =>
    api.get(`/payment/details/${paymentId}`).then(handleData),

  refundPayment: (paymentId: string, amount?: number) =>
    api.post('/payment/refund', { paymentId, amount }).then(handleData),
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
  orderId?: string;
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
  items: { productId: string; name?: string; quantity: number; price?: number }[];
  address?: string;
  paymentId?: string;
};

export type DeliveryPartner = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'idle' | string;
  activeOrders?: number;
  completedToday?: number;
  rating?: number;
};

export type AdminStats = {
  totalOrders: number;
  placed: number;
  packed: number;
  delivered: number;
  activePartners?: number;
  avgDeliveryTime?: string;
};

export type CreateStoreData = {
  name: string;
  address: string;
};

export type CreateProductData = {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
};

export default api;
