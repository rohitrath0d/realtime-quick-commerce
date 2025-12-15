import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  className?: string;
}

const ProductCard = ({
  name,
  price,
  image,
  description,
  category,
  quantity = 0,
  onAdd,
  onRemove,
  className,
}: ProductCardProps) => {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-medium hover:-translate-y-1 group",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-card/90 backdrop-blur-sm rounded-full text-muted-foreground">
          {category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">${price.toFixed(2)}</span>

          {quantity === 0 ? (
            <Button size="sm" variant="accent" onClick={onAdd} className="gap-1">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={onRemove}>
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <Button size="icon" variant="accent" className="h-8 w-8" onClick={onAdd}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
