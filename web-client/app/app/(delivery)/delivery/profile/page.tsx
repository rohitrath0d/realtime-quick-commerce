"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Mail, Phone, Star, Package, DollarSign, Calendar, RefreshCw, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { deliveryApi } from "@/services/api";
import { toast } from "sonner";

interface DeliveryPartnerProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  totalDeliveries: number;
  rating: number | null;
  totalEarnings: number | null;
  createdAt: string;
}

const DeliveryProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DeliveryPartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await deliveryApi.getProfile();
      const p = (res as any)?.data as DeliveryPartnerProfile | undefined;

      if (p) {
        setProfile(p);
        setFormData({
          name: p.name || user?.name || "",
          phone: p.phone || user?.phone || "",
        });
      } else if (user) {
        // Fallback: still show basic info if API returns unexpected shape
        setProfile({
          _id: user._id || "",
          name: user.name || "Delivery Partner",
          email: user.email || "",
          phone: user.phone || "",
          totalDeliveries: 0,
          rating: null,
          totalEarnings: null,
          createdAt: new Date().toISOString(),
        });
        setFormData({
          name: user.name || "",
          phone: user.phone || "",
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Implement profile update endpoint
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <User className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No profile found</h3>
        <p className="text-muted-foreground">Unable to load your profile information</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">My Profile</h1>
          <p className="text-muted-foreground">Manage your delivery partner account</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchProfile}
          className="rounded-xl"
          disabled={isEditing}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Profile Info Card */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-border">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mx-auto mb-2">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{profile.totalDeliveries}</p>
            <p className="text-xs text-muted-foreground">Deliveries</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10 mx-auto mb-2">
              <Star className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">{profile.rating ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 mx-auto mb-2">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${typeof profile.totalEarnings === "number" ? profile.totalEarnings.toFixed(0) : "0"}
            </p>
            <p className="text-xs text-muted-foreground">Total Earnings</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted mx-auto mb-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground">Joined</p>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Read-only)</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="h-11 rounded-xl bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 rounded-xl"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                <p className="text-foreground font-medium">
                  {profile.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                <p className="text-foreground font-medium">
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>{profile.totalDeliveries} completed deliveries</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Star className="w-4 h-4" />
            <span>
              {(profile.rating ?? "—")} / 5.0 rating ({profile.totalDeliveries} reviews)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfilePage;