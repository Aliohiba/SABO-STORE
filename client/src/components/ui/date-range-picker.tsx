import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export function DateRangePicker({ dateRange, setDateRange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
      setIsOpen(false);
    } else if (range?.from) {
      setDateRange({ from: range.from, to: range.from });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !dateRange.from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange.from && dateRange.to ? (
            <>
              {format(dateRange.from, "yyyy-MM-dd")} - {format(dateRange.to, "yyyy-MM-dd")}
            </>
          ) : (
            <span>اختر الفترة</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={dateRange.from}
          selected={{ from: dateRange.from, to: dateRange.to }}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}



