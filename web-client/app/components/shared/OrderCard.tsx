import { MapPin, Clock, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

interface OrderCardProps {
  id: string;
  customerName?: string;
  items: { name: string; quantity: number }[];
  address: string;
  status: "pending" | "confirmed" | "packing" | "packed" | "picked" | "transit" | "delivered" | "cancelled";
  time: string;
  total: number;
  onClick?: () => void;
  className?: string;
  showCustomer?: boolean;
  variant?: "default" | "compact";
}

const OrderCard = ({
  id,
  customerName,
  items,
  address,
  status,
  time,
  total,
  onClick,
  className,
  showCustomer = false,
  variant = "default",
}: OrderCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card rounded-2xl p-5 transition-all duration-300 cursor-pointer hover:shadow-medium hover:-translate-y-1 group",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-muted-foreground">#{id}</span>
            <StatusBadge status={status} pulse={status === "transit" || status === "picked"} />
          </div>
          {showCustomer && customerName && (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              {customerName}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">${total.toFixed(2)}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {time}
          </div>
        </div>
      </div>

      {variant === "default" && (
        <>
          <div className="flex items-start gap-2 mb-3 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
            <span className="line-clamp-2">{address}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {items.length} item{items.length > 1 ? "s" : ""}:
            </span>
            <span className="text-foreground font-medium truncate">
              {items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
            </span>
          </div>
        </>
      )}

      {variant === "compact" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="w-4 h-4" />
          <span>{items.length} items</span>
          <span className="text-border">•</span>
          <MapPin className="w-4 h-4" />
          <span className="truncate">{address.split(",")[0]}</span>
        </div>
      )}

      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default OrderCard;