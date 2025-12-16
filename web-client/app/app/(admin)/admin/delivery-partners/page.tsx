"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Search, Phone, Mail, Star, RefreshCw, 
  // Package 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi, DeliveryPartner } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AdminDeliveryPartnersPage = () => {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "idle">("all");

  const fetchPartners = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getDeliveryPartners();
      setPartners(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load partners");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name?.toLowerCase().includes(search.toLowerCase()) ||
      partner.email?.toLowerCase().includes(search.toLowerCase()) ||
      partner.phone?.includes(search);
    const matchesStatus =
      statusFilter === "all" ||
      // (statusFilter === "active" && partner.status === "active") ||
      // (statusFilter === "idle" && partner.status !== "active");
      (statusFilter === "active" && partner.isAvailable === true) ||
      (statusFilter === "idle" && partner.isAvailable !== true);
    return matchesSearch && matchesStatus;
  });

  // const activeCount = partners.filter(p => p.status === "active").length;
  // isAvailable is maintained on the User model (delivery partners)
  const activeCount = partners.filter((p) => p.isAvailable === true).length;
  const idleCount = partners.length - activeCount;

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
          <h1 className="text-3xl font-bold text-foreground mb-1">Delivery Partners</h1>
          <p className="text-muted-foreground">Manage all delivery partners</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchPartners} className="rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{partners.length}</p>
          <p className="text-sm text-muted-foreground">Total Partners</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <div className="w-8 h-8 rounded-full bg-success mx-auto mb-2 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-bold text-foreground">{activeCount}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <div className="w-8 h-8 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{idleCount}</p>
          <p className="text-sm text-muted-foreground">Idle</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "idle"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="rounded-xl capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((partner) => (
          <div key={partner._id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{partner.name}</h3>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      // partner.status === "active"
                      partner.isAvailable === true
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {/* {partner.status === "active" ? "Active" : "Idle"} */}
                    {partner.isAvailable === true ? "Active" : "Idle"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {partner.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{partner.email}</span>
                </div>
              )}
              {partner.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{partner.phone}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{partner.activeOrders || 0}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{partner.completedToday || 0}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span className="text-lg font-bold text-foreground">{partner.rating || 'N/A'}</span>
                </div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No partners found</h3>
          <p className="text-muted-foreground">Partners will appear here when registered</p>
        </div>
      )}
    </div>
  );
};

export default AdminDeliveryPartnersPage;
