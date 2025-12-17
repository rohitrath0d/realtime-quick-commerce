"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Search, Edit, Trash2, RefreshCw, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { storeApi } from "@/services/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

const StoreProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await storeApi.getProducts();
      setProducts(data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId: string) => {
    setDeletingId(productId);
    try {
      await storeApi.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = async (updatedProduct: Product) => {
    setSavingEdit(true); // show loading state
    try {
      // await storeApi.updateProduct(productId);
      await storeApi.updateProduct(updatedProduct._id, updatedProduct);
      // setProducts((prev) => prev.filter((p) => p._id !== productId));
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
      toast.success("Product deleted successfully");
      setEditingProduct(null); // close modal
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase()) ||
    product.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Products</h1>
          <p className="text-muted-foreground">Manage your store products</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchProducts} className="rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link href="/store/add-product">
            <Button className="gap-2 rounded-xl">
              <PlusCircle className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl"
        />
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground"
                    }`}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="flex gap-2 pt-3 border-t border-border">

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => setEditingProduct(product)} // open modal
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </AlertDialogTrigger>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 gap-2"
                    disabled={deletingId === product._id}
                  >
                    {deletingId === product._id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(product._id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>


      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg relative">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <Input
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Description</label>
                <Input
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Price</label>
                <Input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Image URL</label>
                <Input
                  value={editingProduct.imageUrl || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingProduct.isActive}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, isActive: e.target.checked })
                  }
                />
                <span>Active</span>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={async () => {
                    if (!editingProduct) return;
                    setSavingEdit(true);
                    try {
                      await storeApi.updateProduct(editingProduct._id, editingProduct);
                      setProducts((prev) =>
                        prev.map((p) =>
                          p._id === editingProduct._id ? editingProduct : p
                        )
                      );
                      toast.success("Product updated successfully");
                      setEditingProduct(null);
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Failed to update product");
                    } finally {
                      setSavingEdit(false);
                    }
                  }}
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-6">Start by adding your first product</p>
          <Link href="/store/add-product">
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default StoreProductsPage;
