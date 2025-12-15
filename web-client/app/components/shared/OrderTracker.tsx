import { Check, Clock, Package, Truck, MapPin, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "pending" | "confirmed" | "picked" | "transit" | "delivered";

interface OrderTrackerProps {
  currentStatus: Step;
  className?: string;
}

const steps: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "picked", label: "Picked Up", icon: Package },
  { key: "transit", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PartyPopper },
];

const OrderTracker = ({ currentStatus, className }: OrderTrackerProps) => {
  const currentIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full mx-10">
          <div
            className="h-full bg-linear-to-r from-primary to-primary-glow rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                  isCompleted
                    ? "bg-linear-to-br from-primary to-primary-glow text-primary-foreground shadow-glow"
                    : "bg-muted text-muted-foreground",
                  isCurrent && "ring-4 ring-primary/20 animate-pulse-soft"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center transition-colors duration-300",
                  isCompleted ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracker;
