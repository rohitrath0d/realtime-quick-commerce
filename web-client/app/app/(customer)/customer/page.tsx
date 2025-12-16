/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/shared/ProductCard";
import { productApi } from "@/services/api";
import { useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
import Link from "next/link";
// import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { customerApi, PlaceOrderData } from "@/services/api";
// import { toast } from "@/hooks/use-toast";
import { toast } from "sonner"; // new

console.log("Customer Dashboard rendered");

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

// const categories = ["All", "Fruits", "Vegetables", "Dairy", "Bakery", "Seafood"];

const CustomerDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  // const [activeCategory, setActiveCategory] = useState("All");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { user } = useAuth();
  // const navigate = useNavigate();
  const navigate = useRouter();

  // loading handled inline if needed
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productApi.getPublicProducts();
        // Map backend product fields to frontend shape
        // const mapped = (data || []).map((p: { _id: string; name: string; price?: number; imageUrl?: string; image?: string; description?: string; category?: string }) => ({
        const mapped: Product[] = (data || []).map((p: any) => ({
          id: p._id,
          name: p.name,
          price: p.price ?? 0,
          image: p.imageUrl || '',
          description: p.description || '',
        }));
        //  as Product[];
        setProducts(mapped);
      } catch (error) {
        console.error(error);
      }
      // finally {
      //   // noop
      // }
    };

    fetchProducts();
  }, []);

  // Cart helpers
  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const getQuantity = (productId: string) => cart.find((item) => item.id === productId)?.quantity || 0;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);
    try {
      const orderData: PlaceOrderData = {
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        address: "123 Main Street, Downtown", // Replace with dynamic address if needed
      };
      await customerApi.placeOrder(orderData);
      setCart([]);
      toast.success("Order placed successfully! 🎉");
      // navigate.push("/customer/orders");
      navigate.push("/orders");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Good Morning{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! ☀️
          </h1>
          <p className="text-muted-foreground">What would you like to order today?</p>
        </div>

        {/* <Link to="/customer/orders"> */}
        {/* <Link href="/customer/orders"> */}
        <Link href="/orders">
          <Button variant="outline" className="gap-2 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
            My Orders
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-card border-border"
          />
        </div>
      </div>

      {/* Categories */}
      {/* <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
              activeCategory === category
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {category}
          </button>
        ))}
      </div> */}

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-24">
        {/* fallback message if no product exist */}
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: typeof products[number], index: number) => (
            <div
              key={product.id}
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${0.3 + index * 0.05}s` }}
            >
              <ProductCard
                {...product}
                quantity={getQuantity(product.id)}
                onAdd={() => addToCart(product.id)}
                onRemove={() => removeFromCart(product.id)}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <h2 className="text-lg font-semibold text-muted-foreground">No products available at the moment.</h2>
            <p className="text-muted-foreground">
              Products will be uploaded soon by the store/admin. Please check back later. We appreciate your patience.
            </p>
          </div>
        )}
      </div>

      {/* Cart Bar */}
      {/* {totalItems > 0 && ( */}
      {totalItems > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-linear-to-t from-background via-background to-transparent">
          <div className="container mx-auto max-w-lg">
            <Button
              size="lg"
              // variant="hero"
              variant="default"
              className="w-full h-14 rounded-2xl justify-between px-6 animate-scale-in"
              // onClick={handlePlaceOrder}
              // disabled={isPlacingOrder}
              onClick={() => navigate.push('/cart')} // Navigate to cart page
              disabled={isPlacingOrder}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                  {isPlacingOrder ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                </div>
                <span>{totalItems} items</span>
              </div>
              <span className="text-lg font-bold">${totalPrice.toFixed(2)}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-linear-to-t from-background via-background to-transparent">
          <div className="container mx-auto max-w-lg text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <p className="text-muted-foreground">Browse products and add items to your cart.</p>
            <Link href="/" passHref>
              <Button variant="outline" className="mt-4 w-full">
                Go to Products
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
