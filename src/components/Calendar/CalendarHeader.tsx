import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const CalendarHeader = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-pink-800 flex items-center gap-2">
          {format(currentDate, "MMMM yyyy")}
          <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="ml-4 text-sm border-pink-200 text-pink-700 hover:bg-pink-50"
        >
          Today
        </Button>
      </div>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevMonth}
          className="h-8 w-8 border-pink-200 text-pink-700 hover:bg-pink-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextMonth}
          className="h-8 w-8 border-pink-200 text-pink-700 hover:bg-pink-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;