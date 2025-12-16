// "use client";

// import { useState, useEffect, useCallback } from "react";
// import {
//   Package,
//   CheckCircle2,
//   Clock,
//   Box,
//   RefreshCw,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import StatsCard from "@/components/shared/StatsCard";
// import StatusBadge from "@/components/shared/StatusBadge";
// import { storeApi, Order } from "@/services/api";
// import { useOrderSocket } from "@/hooks/useSocketEvents";
// import { cn } from "@/lib/utils";
// // import { toast } from "@/hooks/use-toast";
// import { toast } from "sonner";
// import Unauthorized from '@/components/Unauthorized';

// const StoreDashboard = () => {
//   const [activeTab, setActiveTab] = useState<"pending" | "processing" | "ready">("pending");
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [unauthorized, setUnauthorized] = useState(false);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [noStore, setNoStore] = useState(false);
//   const [storeName, setStoreName] = useState("");
//   const [storeAddress, setStoreAddress] = useState("");
//   const [creatingStore, setCreatingStore] = useState(false);


//   const fetchOrders = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const data = await storeApi.getStoreOrders();
//       console.log('get orders of particular store -->', data);
//       setOrders(data.data || []);

//       if (!data.storeExists) {
//         setNoStore(true); // show create store form
//       } else {
//         setNoStore(false); // hide form
//         setStoreName(data.store.name);
//         setStoreAddress(data.store.address);
//       }

//     } catch (error) {
//       const err = error as Error & { status?: number };
//       if (err?.status === 403 || err?.status === 404) {
//         setUnauthorized(true);
//         return;
//       }
//       // toast({
//       //   title: "Failed to load orders",
//       //   description: error instanceof Error ? error.message : "Please try again",
//       //   variant: "destructive",
//       // });
//       toast.error(error instanceof Error ? error.message : "Failed to load orders. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   // Socket events
//   useOrderSocket(
//     (newOrder) => {
//       // refresh from server to ensure only store-specific orders are shown
//       fetchOrders();
//       // toast({ title: "New order received!", description: `Order #${newOrder.orderId || newOrder._id}` });
//       toast.success(`New order received! Order #${newOrder.orderId || newOrder._id}`);
//     },
//     // (updatedOrder) => {
//     //   setOrders((prev) =>
//     //     prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
//     //   );
//     // }
//     (updatedOrder) => {
//       if (!["PLACED", "STORE_ACCEPTED", "PACKING", "PACKED"].includes(updatedOrder.status)) {
//         // remove order if it moved beyond store responsibility
//         setOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
//         return;
//       }
//       setOrders((prev) => {
//         const exists = prev.some((o) => o._id === updatedOrder._id);
//         return exists
//           ? prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
//           : prev;
//       });
//     }
//   );

//   // const handleCreateStore = async () => {
//   //   if (!storeName || !storeAddress) {
//   //     toast.error("Name and address are required.");
//   //     return;
//   //   }
//   //   setCreatingStore(true);
//   //   try {
//   //     await storeApi.createStore({ name: storeName, address: storeAddress });
//   //     toast.success("Store created successfully!");
//   //     setNoStore(false);
//   //     fetchOrders();
//   //   } catch (err) {
//   //     toast.error(err instanceof Error ? err.message : "Failed to create store.");
//   //   } finally {
//   //     setCreatingStore(false);
//   //   }
//   // };

//   const handleCreateStore = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!storeName || !storeAddress) {
//       toast.error("Name and address are required");
//       return;
//     }

//     setCreatingStore(true);

//     try {
//       await storeApi.createStore({ name: storeName, address: storeAddress });
//       toast.success("Store created successfully!");

//       // Reset form
//       setStoreName("");
//       setStoreAddress("");

//       // Update state so the form disappears
//       setNoStore(false);

//       // Fetch orders (or store info) again
//       fetchOrders();
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Failed to create store");
//     } finally {
//       setCreatingStore(false);
//     }
//   };

//   const handleAction = async (orderId: string, action: "accept" | "packing" | "packed") => {
//     setActionLoading(orderId);
//     try {
//       let updated: Order;
//       switch (action) {
//         case "accept":
//           updated = await storeApi.acceptOrder(orderId);
//           // toast({ title: "Order accepted", description: `Order #${updated.orderId || updated._id} confirmed` });
//           toast.success(`Order #${updated.orderId || updated._id} accepted and confirmed`);
//           break;
//         case "packing":
//           updated = await storeApi.startPacking(orderId);
//           // toast({ title: "Packing started", description: `Order #${updated.orderId || updated._id} is being packed` });
//           toast.success(`Packing started for Order #${updated.orderId || updated._id}`);
//           break;
//         case "packed":
//           updated = await storeApi.markAsPacked(orderId);
//           // toast({ title: "Order packed", description: `Order #${updated.orderId || updated._id} is ready for pickup` });
//           toast.success(`Order #${updated.orderId || updated._id} marked as packed and ready for pickup`);
//           break;
//       }
//       setOrders((prev) =>
//         prev.map((o) => (o._id === orderId ? updated : o))
//       );
//     } catch (error) {
//       // toast({
//       //   title: "Action failed",
//       //   description: error instanceof Error ? error.message : "Please try again",
//       //   variant: "destructive",
//       // });
//       toast.error(error instanceof Error ? error.message : "Action failed. Please try again.");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const toUiStatus = (status: Order["status"]) => {
//     switch (status) {
//       case "PLACED":
//         return "pending";
//       case "STORE_ACCEPTED":
//         return "confirmed";
//       case "PACKING":
//         return "packing";
//       case "PACKED":
//         return "packed";
//       case "PICKED_UP":
//         return "picked";
//       case "ON_THE_WAY":
//         return "transit";
//       case "DELIVERED":
//         return "delivered";
//       default:
//         return "pending";
//     }
//   };

//   // const pendingOrders = orders.filter((o) => mapToUi(o.status) === 'pending');
//   const pendingOrders = orders.filter(
//     (o) => o.status === "PLACED"
//   );
//   // const processingOrders = orders.filter((o) => ['confirmed', 'packing'].includes(mapToUi(o.status)));
//   const processingOrders = orders.filter(
//     (o) => ["STORE_ACCEPTED", "PACKING"].includes(o.status)
//   );

//   // const readyOrders = orders.filter((o) => mapToUi(o.status) === 'packed');
//   const readyOrders = orders.filter(
//     (o) => o.status === "PACKED"
//   );

//   const getDisplayOrders = () => {
//     switch (activeTab) {
//       case "pending":
//         return pendingOrders;
//       case "processing":
//         return processingOrders;
//       case "ready":
//         return readyOrders;
//       default:
//         return [];
//     }
//   };

//   const getActionButton = (order: Order) => {
//     switch (order.status) {
//       case "PLACED":
//         return (
//           <Button
//             variant="accent"
//             size="sm"
//             className="w-full"
//             onClick={() => handleAction(order._id, "accept")}
//             disabled={actionLoading === order._id}
//           >
//             {actionLoading === order._id ? (
//               <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
//             ) : (
//               "Accept Order"
//             )}
//           </Button>
//         );
//       case "STORE_ACCEPTED":
//         return (
//           <Button
//             variant="secondary"
//             size="sm"
//             className="w-full"
//             onClick={() => handleAction(order._id, "packing")}
//             disabled={actionLoading === order._id}
//           >
//             {actionLoading === order._id ? (
//               <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
//             ) : (
//               "Start Packing"
//             )}
//           </Button>
//         );
//       case "PACKING":
//         return (
//           <Button
//             variant="success"
//             size="sm"
//             className="w-full"
//             onClick={() => handleAction(order._id, "packed")}
//             disabled={actionLoading === order._id}
//           >
//             {actionLoading === order._id ? (
//               <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
//             ) : (
//               "Mark as Packed"
//             )}
//           </Button>
//         );
//       default:
//         return null;
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex items-center justify-center min-h-[50vh]">
//           <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
//         </div>
//       </div>
//     );
//   }

//   if (unauthorized) {
//     return <Unauthorized userRole="store" />;
//   }

//   // Create store form only if user has no store
//   if (noStore) {
//     return (
//       <div className="container mx-auto py-16 text-center">
//         <h2 className="text-2xl font-bold mb-4">Create Your Store</h2>
//         <input
//           type="text"
//           placeholder="Store Name"
//           value={storeName}
//           onChange={(e) => setStoreName(e.target.value)}
//           className="mb-3 p-2 border rounded w-full max-w-sm"
//         />
//         <input
//           type="text"
//           placeholder="Store Address"
//           value={storeAddress}
//           onChange={(e) => setStoreAddress(e.target.value)}
//           className="mb-3 p-2 border rounded w-full max-w-sm"
//         />
//         <Button onClick={handleCreateStore} disabled={creatingStore}>
//           {creatingStore ? "Creating..." : "Create Store"}
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
//         <div>
//           <h1 className="text-3xl font-bold text-foreground mb-1">Store Dashboard</h1>
//           <p className="text-muted-foreground">Manage incoming orders</p>
//         </div>
//         <Button variant="outline" size="icon" onClick={fetchOrders} className="rounded-xl">
//           <RefreshCw className="w-4 h-4" />
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-4 mb-8">
//         <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
//           <StatsCard
//             title="Pending"
//             value={pendingOrders.length}
//             icon={Clock}
//           />
//         </div>
//         <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
//           <StatsCard
//             title="Processing"
//             value={processingOrders.length}
//             icon={Box}
//           />
//         </div>
//         <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
//           <StatsCard
//             title="Ready"
//             value={readyOrders.length}
//             icon={CheckCircle2}
//           />
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-2 mb-6 animate-fade-up opacity-0" style={{ animationDelay: "0.35s" }}>
//         <button
//           onClick={() => setActiveTab("pending")}
//           className={cn(
//             "px-5 py-2.5 rounded-xl font-medium transition-all duration-300",
//             activeTab === "pending"
//               ? "bg-warning text-warning-foreground shadow-glow"
//               : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
//           )}
//         >
//           Pending ({pendingOrders.length})
//         </button>
//         <button
//           onClick={() => setActiveTab("processing")}
//           className={cn(
//             "px-5 py-2.5 rounded-xl font-medium transition-all duration-300",
//             activeTab === "processing"
//               ? "bg-primary text-primary-foreground shadow-glow"
//               : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
//           )}
//         >
//           Processing ({processingOrders.length})
//         </button>
//         <button
//           onClick={() => setActiveTab("ready")}
//           className={cn(
//             "px-5 py-2.5 rounded-xl font-medium transition-all duration-300",
//             activeTab === "ready"
//               ? "bg-success text-success-foreground shadow-glow"
//               : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
//           )}
//         >
//           Ready ({readyOrders.length})
//         </button>
//       </div>

//       {/* Orders Grid */}
//       <div className="grid md:grid-cols-2 gap-4">
//         {getDisplayOrders().map((order, index) => (
//           <div
//             key={order._id}
//             className="glass-card rounded-2xl p-5 animate-fade-up opacity-0"
//             style={{ animationDelay: `${0.4 + index * 0.05}s` }}
//           >
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <div className="flex items-center gap-2 mb-1">
//                   <span className="text-sm text-muted-foreground">#{order._id}</span>
//                   {/* <StatusBadge status={mapToUi(order.status) as any} /> */}
//                   <StatusBadge status={toUiStatus(order.status) as any} />
//                 </div>
//                 <h3 className="font-semibold text-foreground">{typeof order.customer === 'string' ? 'Customer' : order.customer?.name || 'Customer'}</h3>
//               </div>
//               <span className="text-xl font-bold text-primary">${order.total.toFixed(2)}</span>
//             </div>

//             <div className="space-y-2 mb-4">
//               {order.items.map((item, i) => (
//                 <div key={i} className="flex justify-between text-sm">
//                   <span className="text-foreground">{item.qty}x {item.name}</span>
//                   <span className="text-muted-foreground">${(item.price * item.qty).toFixed(2)}</span>
//                 </div>
//               ))}
//             </div>

//             <div className="text-sm text-muted-foreground mb-4">
//               <span className="text-xs uppercase tracking-wide">Delivery to:</span>
//               <p className="text-foreground">{typeof order.store === 'string' ? 'Store' : order.store?.name || 'Store'}</p>
//             </div>

//             {getActionButton(order)}
//           </div>
//         ))}
//       </div>

//       {/* Empty State */}
//       {getDisplayOrders().length === 0 && (
//         <div className="text-center py-16 animate-fade-in">
//           <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-foreground mb-2">No {activeTab} orders</h3>
//           <p className="text-muted-foreground">Orders will appear here when available</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StoreDashboard;


"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  CheckCircle2,
  Clock,
  Box,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/shared/StatsCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { storeApi, Order } from "@/services/api";
import { useOrderSocket } from "@/hooks/useSocketEvents";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Unauthorized from "@/components/Unauthorized";

const StoreDashboard = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "processing" | "ready">("pending");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noStore, setNoStore] = useState(false); // whether to show create store form
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [creatingStore, setCreatingStore] = useState(false);

  // -------------------------------
  // 1️⃣ Check if store exists
  // -------------------------------
  const checkStoreExistence = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await storeApi.getStore(); // new endpoint GET /api/store
      if (!data.exists) {
        setNoStore(true); // show create store form
      } else {
        setNoStore(false); // hide form
        setStoreName(data.store.name);
        setStoreAddress(data.store.address);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to check store");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // -------------------------------
  // 2️⃣ Fetch orders
  // -------------------------------
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await storeApi.getStoreOrders();
      setOrders(data.data || []);
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err?.status === 403 || err?.status === 404) {
        setUnauthorized(true);
        return;
      }
      toast.error(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStoreExistence();
    fetchOrders();
  }, [checkStoreExistence, fetchOrders]);

  // -------------------------------
  // 3️⃣ Socket updates
  // -------------------------------
  useOrderSocket(
    (newOrder) => {
      fetchOrders();
      toast.success(`New order received! Order #${newOrder.orderId || newOrder._id}`);
    },
    (updatedOrder) => {
      if (!["PLACED", "STORE_ACCEPTED", "PACKING", "PACKED"].includes(updatedOrder.status)) {
        setOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
        return;
      }
      setOrders((prev) =>
        prev.some((o) => o._id === updatedOrder._id)
          ? prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
          : prev
      );
    }
  );

  // -------------------------------
  // 4️⃣ Create store
  // -------------------------------
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeAddress) {
      toast.error("Name and address are required");
      return;
    }

    setCreatingStore(true);
    try {
      await storeApi.createStore({ name: storeName, address: storeAddress });
      toast.success("Store created successfully!");
      setNoStore(false); // hide form after creation
      fetchOrders(); // fetch orders for newly created store
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create store");
    } finally {
      setCreatingStore(false);
    }
  };

  // -------------------------------
  // 5️⃣ Order actions
  // -------------------------------
  const handleAction = async (orderId: string, action: "accept" | "packing" | "packed") => {
    setActionLoading(orderId);
    try {
      let updated: Order;
      switch (action) {
        case "accept":
          updated = await storeApi.acceptOrder(orderId);
          toast.success(`Order #${updated.orderId || updated._id} accepted`);
          break;
        case "packing":
          updated = await storeApi.startPacking(orderId);
          toast.success(`Packing started for Order #${updated.orderId || updated._id}`);
          break;
        case "packed":
          updated = await storeApi.markAsPacked(orderId);
          toast.success(`Order #${updated.orderId || updated._id} marked as packed`);
          break;
      }
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const toUiStatus = (status: Order["status"]) => {
    switch (status) {
      case "PLACED":
        return "pending";
      case "STORE_ACCEPTED":
        return "confirmed";
      case "PACKING":
        return "packing";
      case "PACKED":
        return "packed";
      case "PICKED_UP":
        return "picked";
      case "ON_THE_WAY":
        return "transit";
      case "DELIVERED":
        return "delivered";
      default:
        return "pending";
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "PLACED");
  const processingOrders = orders.filter((o) => ["STORE_ACCEPTED", "PACKING"].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === "PACKED");

  const getDisplayOrders = () => {
    switch (activeTab) {
      case "pending":
        return pendingOrders;
      case "processing":
        return processingOrders;
      case "ready":
        return readyOrders;
      default:
        return [];
    }
  };

  const getActionButton = (order: Order) => {
    switch (order.status) {
      case "PLACED":
        return (
          <Button
            variant="accent"
            size="sm"
            className="w-full"
            onClick={() => handleAction(order._id, "accept")}
            disabled={actionLoading === order._id}
          >
            {actionLoading === order._id ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : "Accept Order"}
          </Button>
        );
      case "STORE_ACCEPTED":
        return (
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => handleAction(order._id, "packing")}
            disabled={actionLoading === order._id}
          >
            {actionLoading === order._id ? <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" /> : "Start Packing"}
          </Button>
        );
      case "PACKING":
        return (
          <Button
            variant="success"
            size="sm"
            className="w-full"
            onClick={() => handleAction(order._id, "packed")}
            disabled={actionLoading === order._id}
          >
            {actionLoading === order._id ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : "Mark as Packed"}
          </Button>
        );
      default:
        return null;
    }
  };

  // -------------------------------
  // 6️⃣ Render
  // -------------------------------
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
    return <Unauthorized userRole="store" />;
  }

  // Create store form only if user has no store
  if (noStore) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Create Your Store</h2>
        <input
          type="text"
          placeholder="Store Name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className="mb-3 p-2 border rounded w-full max-w-sm"
        />
        <input
          type="text"
          placeholder="Store Address"
          value={storeAddress}
          onChange={(e) => setStoreAddress(e.target.value)}
          className="mb-3 p-2 border rounded w-full max-w-sm"
        />
        <Button onClick={handleCreateStore} disabled={creatingStore}>
          {creatingStore ? "Creating..." : "Create Store"}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Store Dashboard</h1>
          <p className="text-muted-foreground">Manage incoming orders</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchOrders} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
          <StatsCard
            title="Pending"
            value={pendingOrders.length}
            icon={Clock}
          />
        </div>
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
          <StatsCard
            title="Processing"
            value={processingOrders.length}
            icon={Box}
          />
        </div>
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
          <StatsCard
            title="Ready"
            value={readyOrders.length}
            icon={CheckCircle2}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 animate-fade-up opacity-0" style={{ animationDelay: "0.35s" }}>
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium transition-all duration-300",
            activeTab === "pending"
              ? "bg-warning text-warning-foreground shadow-glow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          Pending ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("processing")}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium transition-all duration-300",
            activeTab === "processing"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          Processing ({processingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("ready")}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium transition-all duration-300",
            activeTab === "ready"
              ? "bg-success text-success-foreground shadow-glow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          Ready ({readyOrders.length})
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {getDisplayOrders().map((order, index) => (
          <div
            key={order._id}
            className="glass-card rounded-2xl p-5 animate-fade-up opacity-0"
            style={{ animationDelay: `${0.4 + index * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">#{order._id}</span>
                  {/* <StatusBadge status={mapToUi(order.status) as any} /> */}
                  <StatusBadge status={toUiStatus(order.status) as any} />
                </div>
                <h3 className="font-semibold text-foreground">{typeof order.customer === 'string' ? 'Customer' : order.customer?.name || 'Customer'}</h3>
              </div>
              <span className="text-xl font-bold text-primary">${order.total.toFixed(2)}</span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-foreground">{item.qty}x {item.name}</span>
                  <span className="text-muted-foreground">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground mb-4">
              <span className="text-xs uppercase tracking-wide">Delivery to:</span>
              <p className="text-foreground">{typeof order.store === 'string' ? 'Store' : order.store?.name || 'Store'}</p>
            </div>

            {getActionButton(order)}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {getDisplayOrders().length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No {activeTab} orders</h3>
          <p className="text-muted-foreground">Orders will appear here when available</p>
        </div>
      )}
    </div>
  );
};

export default StoreDashboard;