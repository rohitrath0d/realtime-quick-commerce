import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
}

const StatsCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className,
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-5 transition-all duration-300 hover:shadow-medium group",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {change && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              changeType === "positive" && "bg-success/15 text-success",
              changeType === "negative" && "bg-destructive/15 text-destructive",
              changeType === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
};

export default StatsCard;
