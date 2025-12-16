"use client";

import { useState, useEffect, useCallback } from "react";
import { Store, MapPin, Calendar, Trash2, AlertTriangle, RefreshCw, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { storeApi } from "@/services/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface StoreData {
  _id: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

const MyStorePage = () => {
  const router = useRouter();
  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [noStore, setNoStore] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [isCreating, setIsCreating] = useState(false);

  const fetchStore = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await storeApi.getStore();
      if (data.exists) {
        setStore(data.store);
        setNoStore(false);
      } else {
        setNoStore(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load store");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      toast.error("Name and address are required");
      return;
    }

    setIsCreating(true);
    try {
      await storeApi.createStore(formData);
      toast.success("Store created successfully!");
      fetchStore();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create store");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!store) return;
    
    setIsDeleting(true);
    try {
      await storeApi.deleteStore(store._id);
      toast.success("Store deleted successfully");
      setStore(null);
      setNoStore(true);
      router.push("/store");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete store");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Create Store Form
  if (noStore) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <Store className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Store</h1>
          <p className="text-muted-foreground">Set up your store to start receiving orders</p>
        </div>

        <form onSubmit={handleCreateStore} className="glass-card rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Store Name *</Label>
            <Input
              id="name"
              placeholder="Enter store name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Store Address *</Label>
            <Input
              id="address"
              placeholder="Enter store address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl gap-2" disabled={isCreating}>
            {isCreating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Store className="w-4 h-4" />
            )}
            Create Store
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">My Store</h1>
          <p className="text-muted-foreground">View and manage your store details</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchStore} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Store Details Card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
            <Store className="w-8 h-8 text-orange-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{store?.name}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              store?.isActive 
                ? "bg-success/15 text-success" 
                : "bg-muted text-muted-foreground"
            }`}>
              {store?.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium text-foreground">{store?.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium text-foreground">
                {store?.createdAt ? new Date(store.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card rounded-2xl p-6 border-destructive/20 border-2">
        <h3 className="text-lg font-semibold text-destructive mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Deleting your store will remove all associated data including products and orders. This action cannot be undone.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Store
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Store
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{store?.name}&quot;? All products and order history will be permanently removed. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStore}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Store
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default MyStorePage;
