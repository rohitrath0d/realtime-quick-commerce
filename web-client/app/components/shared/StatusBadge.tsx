import { cn } from "@/lib/utils";

type StatusType = "pending" | "confirmed" | "packing" | "packed" | "picked" | "transit" | "delivered" | "cancelled";

interface StatusBadgeProps {
  status: StatusType;
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
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      {(status === "transit" || status === "picked") && pulse && (
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