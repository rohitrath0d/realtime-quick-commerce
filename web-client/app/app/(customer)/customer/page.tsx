/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/shared/ProductCard";
import { productApi } from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

const CustomerDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useRouter();
  const { addToCart, removeFromCart, getQuantity, totalItems, totalPrice } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.getPublicProducts();
        const mapped: Product[] = (data || []).map((p: any) => ({
          id: p._id,
          name: p.name,
          price: p.price ?? 0,
          image: p.imageUrl || '',
          description: p.description || '',
          category: p.category || 'General',
        }));
        setProducts(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image,
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(productId);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! ☀️
          </h1>
          <p className="text-muted-foreground">What would you like to order today?</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="outline" className="gap-2 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
              My Orders
            </Button>
          </Link>
          
          <Button 
            variant="default" 
            className="gap-2 animate-fade-up opacity-0 relative" 
            style={{ animationDelay: "0.2s" }}
            onClick={() => navigate.push('/cart')}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Search */}
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

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-24">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-24">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-up opacity-0"
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <ProductCard
                  {...product}
                  quantity={getQuantity(product.id)}
                  onAdd={() => handleAddToCart(product.id)}
                  onRemove={() => handleRemoveFromCart(product.id)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <h2 className="text-lg font-semibold text-muted-foreground">No products available at the moment.</h2>
              <p className="text-muted-foreground">
                Products will be uploaded soon by the store/admin. Please check back later.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-linear-to-t from-background via-background to-transparent z-50">
          <div className="container mx-auto max-w-lg">
            <Button
              size="lg"
              variant="default"
              className="w-full h-14 rounded-2xl justify-between px-6 animate-scale-in shadow-lg"
              onClick={() => navigate.push('/cart')}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span>{totalItems} items</span>
              </div>
              <span className="text-lg font-bold">${totalPrice.toFixed(2)}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
