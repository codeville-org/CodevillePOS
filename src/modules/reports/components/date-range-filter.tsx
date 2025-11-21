import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DateFilterType = "today" | "week" | "month" | "quarter" | "custom";

export interface DateRangeFilterValue {
  type: DateFilterType;
  startDate?: Date;
  endDate?: Date;
}

interface Props {
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
  className?: string;
}

export function DateRangeFilter({ value, onChange, className }: Props) {
  const formatDateRange = (startDate?: Date, endDate?: Date) => {
    if (!startDate || !endDate) return "Pick a date range";

    const start = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
    const end = endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    return `${start} - ${end}`;
  };

  const getPresetDateRange = (type: DateFilterType): DateRangeFilterValue => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (type) {
      case "today":
        return {
          type: "today",
          startDate: new Date(today),
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };

      case "week": {
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(today.getDate() - daysToMonday);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return {
          type: "week",
          startDate: startOfWeek,
          endDate: endOfWeek
        };
      }

      case "month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        endOfMonth.setHours(23, 59, 59, 999);

        return {
          type: "month",
          startDate: startOfMonth,
          endDate: endOfMonth
        };
      }

      case "quarter": {
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const startOfQuarter = new Date(
          today.getFullYear(),
          currentQuarter * 3,
          1
        );
        const endOfQuarter = new Date(
          today.getFullYear(),
          currentQuarter * 3 + 3,
          0
        );
        endOfQuarter.setHours(23, 59, 59, 999);

        return {
          type: "quarter",
          startDate: startOfQuarter,
          endDate: endOfQuarter
        };
      }

      default:
        return { type: "custom" };
    }
  };

  const handlePresetChange = (preset: DateFilterType) => {
    if (preset === "custom") {
    } else {
      const dateRange = getPresetDateRange(preset);
      onChange(dateRange);
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          // Reload window
          window.location.reload();
        }}
      >
        <RefreshCwIcon />
      </Button>

      {/* Preset Filter Selector */}
      <Select
        value={value.type}
        onValueChange={(newValue: DateFilterType) =>
          handlePresetChange(newValue)
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
        </SelectContent>
      </Select>

      {/* Display current selection for non-custom types */}
      {value.type !== "custom" && value.startDate && value.endDate && (
        <div className="text-sm text-muted-foreground">
          {formatDateRange(value.startDate, value.endDate)}
        </div>
      )}
    </div>
  );
}
