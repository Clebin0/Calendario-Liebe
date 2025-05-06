
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface DateCellProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  hasEvents: boolean;
  onSelect: () => void;
}

const DateCell = ({
  date,
  isSelected,
  isToday,
  isCurrentMonth,
  hasEvents,
  onSelect,
}: DateCellProps) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full aspect-square rounded-lg flex items-center justify-center text-sm transition-all duration-300 hover:scale-105 relative group",
        isCurrentMonth ? "text-gray-900" : "text-gray-400",
        isSelected
          ? "bg-pink-400 text-white hover:bg-pink-500 font-semibold shadow-lg"
          : isToday
          ? "bg-pink-100 text-pink-800 hover:bg-pink-200 font-medium"
          : hasEvents
          ? "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
          : "hover:bg-pink-50"
      )}
    >
      <span className="z-10 relative">
        {format(date, "d")}
        {isSelected && (
          <Heart className="absolute -top-3 -right-3 h-3 w-3 text-pink-300 fill-pink-300 animate-pulse" />
        )}
      </span>
      {hasEvents && !isSelected && (
        <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
      )}
      {isSelected && (
        <div className="absolute inset-0 bg-pink-200 opacity-20 rounded-lg animate-pulse" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-pink-50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300" />
    </button>
  );
};

export default DateCell;
