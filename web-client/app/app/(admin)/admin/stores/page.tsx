"use client";

import { useState, useEffect, useCallback } from "react";
import { Store, Search, MapPin, Calendar, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { adminApi } from "@/services/api";
import { toast } from "sonner";

interface StoreData {
  _id: string;
  name: string;
  address: string;
  isActive: boolean;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const AdminStoresPage = () => {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllStores();
      setStores(data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load stores");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleDeleteStore = async (storeId: string) => {
    setDeletingId(storeId);
    try {
      await adminApi.deleteStore(storeId);
      setStores((prev) => prev.filter((s) => s._id !== storeId));
      toast.success("Store deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete store");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredStores = stores.filter((store) =>
    store.name?.toLowerCase().includes(search.toLowerCase()) ||
    store.address?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold text-foreground mb-1">Stores</h1>
          <p className="text-muted-foreground">Manage all registered stores</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchStores} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 text-center">
          <Store className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stores.length}</p>
          <p className="text-sm text-muted-foreground">Total Stores</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <div className="w-8 h-8 rounded-full bg-success mx-auto mb-2 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stores.filter(s => s.isActive).length}
          </p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search stores by name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl"
        />
      </div>

      {/* Stores Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map((store) => (
          <div key={store._id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{store.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    store.isActive 
                      ? "bg-success/15 text-success" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {store.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{store.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Created: {new Date(store.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {store.owner && (
              <div className="p-3 rounded-lg bg-muted/50 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Owner</p>
                <p className="text-sm font-medium text-foreground">{store.owner.name}</p>
                <p className="text-xs text-muted-foreground">{store.owner.email}</p>
              </div>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full gap-2"
                  disabled={deletingId === store._id}
                >
                  {deletingId === store._id ? (
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
                    Are you sure you want to delete &quot;{store.name}&quot;? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteStore(store._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-16">
          <Store className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No stores found</h3>
          <p className="text-muted-foreground">Stores will appear here when registered</p>
        </div>
      )}
    </div>
  );
};

export default AdminStoresPage;
