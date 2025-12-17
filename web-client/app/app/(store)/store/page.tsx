// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import {
//   Package,
//   CheckCircle2,
//   Clock,
//   TrendingUp,
//   Store,
//   ShoppingBag,
//   RefreshCw,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import StatsCard from "@/components/shared/StatsCard";
// import { storeApi, Order } from "@/services/api";
// import { useOrderSocket } from "@/hooks/useSocketEvents";
// import { cn } from "@/lib/utils";
// import { toast } from "sonner";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// const StoreDashboard = () => {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [storeInfo, setStoreInfo] = useState<{ name: string; address: string } | null>(null);
//   const [noStore, setNoStore] = useState(false);
//   const [stats, setStats] = useState<{
//     totalOrders: number;
//     placed: number;
//     processing: number;
//     packed: number;
//     delivered: number;
//     revenue: number;
//   } | null>(null);

//   const router = useRouter();

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       // const data = await storeApi.getStoreOrders();
//       // setOrders(data.data || []);
//       const [storeRes, ordersRes, statsRes] = await Promise.all([
//         storeApi.getStore(),
//         storeApi.getAllStoreOrders(),
//         storeApi.getStats(),
//       ]);

//       // if (!data.storeExists) {
//       if (!storeRes.exists) {
//         setNoStore(true);
//       } else {
//         // setNoStore(false);
//         // setStoreInfo(data.store);
//         setOrders([]);
//         setStoreInfo(null);
//         setStats(null);
//         return;
//       }

//       setNoStore(false);
//       setStoreInfo(storeRes.store || null);
//       setOrders(ordersRes.data || []);
//       setStats((statsRes as any)?.data || null);
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Failed to load data");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // Socket events
//   useOrderSocket(
//     () => {
//       fetchData();
//       toast.success("New order received!");
//     },
//     () => {
//       fetchData();
//     }
//   );

//   // Stats calculations
//   // const pendingOrders = orders.filter((o) => o.status === "PLACED").length;
//   // const processingOrders = orders.filter((o) => ["STORE_ACCEPTED", "PACKING"].includes(o.status)).length;
//   // const completedOrders = orders.filter((o) => o.status === "PACKED").length;
//   // const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
//   const pendingOrders = stats?.placed ?? orders.filter((o) => o.status === "PLACED").length;
//   const processingOrders = stats?.processing ?? orders.filter((o) => ["STORE_ACCEPTED", "PACKING"].includes(o.status)).length;
//   const completedOrders = stats?.packed ?? orders.filter((o) => o.status === "PACKED").length;
//   const totalRevenue = stats?.revenue ?? 0;

//   const recentOrders = orders.slice(0, 5);

//   if (noStore) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-md mx-auto text-center py-20">
//           <Store className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
//           <h2 className="text-2xl font-bold mb-2">No Store Found</h2>
//           <p className="text-muted-foreground mb-6">
//             You don&apos;t have a store yet. Create one to start receiving orders.
//           </p>
//           <Button onClick={() => router.push("/store/my-store")}>
//             Create Your Store
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//         <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
//           <h1 className="text-3xl font-bold text-foreground mb-1">
//             {storeInfo?.name || "Store Dashboard"}
//           </h1>
//           <p className="text-muted-foreground">
//             Welcome back! Here&apos;s an overview of your store
//           </p>
//         </div>

//         <Button variant="outline" className="gap-2" onClick={fetchData} disabled={isLoading}>
//           <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
//           Refresh
//         </Button>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
//           <StatsCard
//             title="New Orders"
//             value={pendingOrders}
//             icon={Clock}
//             change="Pending"
//             changeType="neutral"
//           />
//         </div>
//         <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
//           <StatsCard
//             title="Processing"
//             value={processingOrders}
//             icon={Package}
//             change="In Progress"
//             changeType="neutral"
//           />
//         </div>
//         <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
//           <StatsCard
//             title="Ready for Pickup"
//             value={completedOrders}
//             icon={CheckCircle2}
//             change="Completed"
//             changeType="positive"
//           />
//         </div>
//         <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.35s" }}>
//           <StatsCard
//             title="Total Revenue"
//             value={`$${totalRevenue.toFixed(2)}`}
//             icon={TrendingUp}
//             change="Today"
//             changeType="neutral"
//           />
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//         <Link href="/store/orders" className="block">
//           <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer animate-fade-up opacity-0" style={{ animationDelay: "0.4s" }}>
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
//                 <Package className="w-6 h-6 text-orange-600" />
//               </div>
//               <div>
//                 <h3 className="font-semibold">Manage Orders</h3>
//                 <p className="text-sm text-muted-foreground">Accept, pack and manage orders</p>
//               </div>
//             </div>
//           </div>
//         </Link>

//         <Link href="/store/products" className="block">
//           <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer animate-fade-up opacity-0" style={{ animationDelay: "0.45s" }}>
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//                 <ShoppingBag className="w-6 h-6 text-blue-600" />
//               </div>
//               <div>
//                 <h3 className="font-semibold">View Products</h3>
//                 <p className="text-sm text-muted-foreground">Manage your product catalog</p>
//               </div>
//             </div>
//           </div>
//         </Link>

//         <Link href="/store/add-product" className="block">
//           <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer animate-fade-up opacity-0" style={{ animationDelay: "0.5s" }}>
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
//                 <Store className="w-6 h-6 text-green-600" />
//               </div>
//               <div>
//                 <h3 className="font-semibold">Add Product</h3>
//                 <p className="text-sm text-muted-foreground">Add new items to your store</p>
//               </div>
//             </div>
//           </div>
//         </Link>
//       </div>

//       {/* Recent Orders */}
//       <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.55s" }}>
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold">Recent Orders</h2>
//           <Link href="/store/orders">
//             <Button variant="ghost" size="sm">View All</Button>
//           </Link>
//         </div>

//         {isLoading ? (
//           <div className="space-y-3">
//             {[...Array(3)].map((_, i) => (
//               <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
//             ))}
//           </div>
//         ) : recentOrders.length === 0 ? (
//           <div className="text-center py-12 bg-card rounded-xl border border-border">
//             <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//             <p className="text-muted-foreground">No orders yet</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {recentOrders.map((order) => (
//               <div
//                 key={order._id}
//                 className="p-4 rounded-xl bg-card border border-border flex items-center justify-between"
//               >
//                 <div className="flex items-center gap-4">
//                   <div className={cn(
//                     "w-10 h-10 rounded-lg flex items-center justify-center",
//                     order.status === "PLACED" ? "bg-yellow-100 dark:bg-yellow-900/30" :
//                       order.status === "PACKED" ? "bg-green-100 dark:bg-green-900/30" :
//                         "bg-blue-100 dark:bg-blue-900/30"
//                   )}>
//                     <Package className={cn(
//                       "w-5 h-5",
//                       order.status === "PLACED" ? "text-yellow-600" :
//                         order.status === "PACKED" ? "text-green-600" :
//                           "text-blue-600"
//                     )} />
//                   </div>
//                   <div>
//                     <p className="font-medium">Order #{order._id.slice(-8).toUpperCase()}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {order.items.length} item{order.items.length > 1 ? 's' : ''} • {order.status.replace(/_/g, ' ')}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   {/* <p className="font-bold">${order.total.toFixed(2)}</p> */}
//                   <p className="font-bold">${order.total ? order.total.toFixed(2) : '0.00'}</p>
//                   <p className="text-xs text-muted-foreground">
//                     {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ''}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StoreDashboard;


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  CheckCircle2,
  Clock,
  TrendingUp,
  Store,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/shared/StatsCard";
import { storeApi, Order } from "@/services/api";
import { useOrderSocket } from "@/hooks/useSocketEvents";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const StoreDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState<{ name: string; address: string } | null>(null);
  const [noStore, setNoStore] = useState(false);
  const [stats, setStats] = useState<{
    totalOrders: number;
    placed: number;
    processing: number;
    packed: number;
    delivered: number;
    revenue: number;
  } | null>(null);

  const router = useRouter();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [storeRes, ordersRes, statsRes] = await Promise.all([
        storeApi.getStore(),
        storeApi.getAllStoreOrders(),
        storeApi.getStats(),
      ]);

      // Check if store exists
      if (!storeRes.exists) {
        setNoStore(true);
        setStoreInfo(null);
        setOrders([]);
        setStats(null);
        return; // Early return when no store exists
      }

      // Store exists, populate data
      setNoStore(false);
      setStoreInfo(storeRes.store || null);
      setOrders(ordersRes.data || []);
      setStats((statsRes as any)?.data || null);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket events
  useOrderSocket(
    () => {
      fetchData();
      toast.success("New order received!");
    },
    () => {
      fetchData();
    }
  );

  // Calculate stats with fallbacks
  const pendingOrders = stats?.placed ?? 0;
  const processingOrders = stats?.processing ?? 0;
  const completedOrders = stats?.packed ?? 0;
  const totalRevenue = stats?.revenue ?? 0;

  const recentOrders = orders.slice(0, 5);

  // Show "No Store" state
  if (noStore) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center py-20">
          <Store className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">No Store Found</h2>
          <p className="text-muted-foreground mb-6">
            You don&apos;t have a store yet. Create one to start receiving orders.
          </p>
          <Button onClick={() => router.push("/store/my-store")}>
            Create Your Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {storeInfo?.name || "Store Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your store
          </p>
        </div>

        <Button variant="outline" className="gap-2" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
          <StatsCard
            title="New Orders"
            value={pendingOrders}
            icon={Clock}
            change="Pending"
            changeType="neutral"
          />
        </div>
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
          <StatsCard
            title="Processing"
            value={processingOrders}
            icon={Package}
            change="In Progress"
            changeType="neutral"
          />
        </div>
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
          <StatsCard
            title="Ready for Pickup"
            value={completedOrders}
            icon={CheckCircle2}
            change="Completed"
            changeType="positive"
          />
        </div>
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.35s" }}>
          <StatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={TrendingUp}
            change="All Time"
            changeType="neutral"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/store/orders" className="block">
          <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer animate-fade-up opacity-0" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Orders</h3>
                <p className="text-sm text-muted-foreground">Accept, pack and manage orders</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/store/products" className="block">
          <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer animate-fade-up opacity-0" style={{ animationDelay: "0.45s" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">View Products</h3>
                <p className="text-sm text-muted-foreground">Manage your product catalog</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/store/add-product" className="block">
          <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer animate-fade-up opacity-0" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Add Product</h3>
                <p className="text-sm text-muted-foreground">Add new items to your store</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.55s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Link href="/store/orders">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 rounded-xl bg-card border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    order.status === "PLACED" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                      order.status === "PACKED" ? "bg-green-100 dark:bg-green-900/30" :
                        "bg-blue-100 dark:bg-blue-900/30"
                  )}>
                    <Package className={cn(
                      "w-5 h-5",
                      order.status === "PLACED" ? "text-yellow-600" :
                        order.status === "PACKED" ? "text-green-600" :
                          "text-blue-600"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} • {order.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${order.total ? order.total.toFixed(2) : '0.00'}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDashboard;