import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  label?: string;
}

export function RatingDisplay({
  rating,
  maxRating = 10,
  size = "md",
  showValue = true,
  label,
}: RatingDisplayProps) {
  const getRatingColor = (r: number) => {
    if (r >= 8) return "text-green-600 bg-green-50";
    if (r >= 6) return "text-yellow-600 bg-yellow-50";
    if (r >= 4) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getRatingLabel = (r: number) => {
    if (r >= 9) return "Superb";
    if (r >= 8) return "Fabulous";
    if (r >= 7) return "Very Good";
    if (r >= 6) return "Good";
    if (r >= 5) return "Okay";
    return "Poor";
  };

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-lg px-3 py-1.5",
  };

  return (
    <div className="flex items-center gap-2">
      {showValue && (
        <span
          className={cn(
            "font-bold rounded-md",
            sizeClasses[size],
            getRatingColor(rating)
          )}
        >
          {rating.toFixed(1)}
        </span>
      )}
      <div className="flex flex-col">
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
        <span className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>
          {getRatingLabel(rating)}
        </span>
      </div>
    </div>
  );
}

interface RatingBarProps {
  label: string;
  value: number;
  max?: number;
}

export function RatingBar({ label, value, max = 10 }: RatingBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}
