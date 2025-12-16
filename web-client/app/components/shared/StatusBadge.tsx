import { cn } from "@/lib/utils";

type StatusType = "pending" | "confirmed" | "packing" | "packed" | "picked" | "transit" | "delivered" | "cancelled";

interface StatusBadgeProps {
  status: string;
  className?: string;
  pulse?: boolean;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  packing: {
    label: "Packing",
    className: "bg-accent/15 text-accent border-accent/30",
  },
  packed: {
    label: "Packed",
    className: "bg-accent/15 text-accent border-accent/30",
  },
  picked: {
    label: "Picked Up",
    className: "bg-accent/15 text-accent border-accent/30",
  },
  transit: {
    label: "On the Way",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  delivered: {
    label: "Delivered",
    className: "bg-success/15 text-success border-success/30",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

const StatusBadge = ({ status, className, pulse = false }: StatusBadgeProps) => {
  const normalizeStatus = (raw: string): StatusType => {
    const s = (raw || "").toString().trim();
    const upper = s.toUpperCase();

    switch (upper) {
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
      case "CANCELLED":
        return "cancelled";
      default: {
        const lower = s.toLowerCase();
        if (lower === "pending") return "pending";
        if (lower === "confirmed") return "confirmed";
        if (lower === "packing") return "packing";
        if (lower === "packed") return "packed";
        if (lower === "picked") return "picked";
        if (lower === "transit") return "transit";
        if (lower === "delivered") return "delivered";
        if (lower === "cancelled") return "cancelled";
        return "pending";
      }
    }
  };

  const normalized = normalizeStatus(status);
  const config = statusConfig[normalized];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      {(normalized === "transit" || normalized === "picked") && pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge;