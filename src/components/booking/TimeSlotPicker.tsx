"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDayAvailability } from "@/lib/hooks";
import type { AvailabilitySlot } from "@/lib/types";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const SLOT_STEP_MINS = 30;

interface TimeSlotPickerProps {
  technicianId: string;
  /** Full weekly availability of the technician (used to grey out days with no coverage). */
  availability: AvailabilitySlot[];
  /** Duration of the service in minutes — used to size each bookable slot window. */
  durationMins?: number;
  /** Currently selected datetime (ISO string) — controlled value. */
  value: string;
  /** Called with the selected datetime as an ISO string. */
  onChange: (iso: string) => void;
}

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function roundToNext(minutes: number, step: number): number {
  return Math.ceil(minutes / step) * step;
}

export function TimeSlotPicker({
  technicianId,
  availability,
  durationMins = 60,
  value,
  onChange,
}: TimeSlotPickerProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string>("");

  // Days of the week the technician actually works (for greying out empty days)
  const coveredDays = useMemo(
    () => new Set(availability.map((s) => s.dayOfWeek)),
    [availability]
  );

  const { data: dayAvail, isLoading, isError } = useDayAvailability(
    technicianId,
    selectedDateKey
  );

  const navigateMonth = (dir: number) => {
    const d = new Date(viewYear, viewMonth + dir, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const startOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = startOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const isPast = (d: Date) => {
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const todayAt = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return t < todayAt;
  };

  const selectDate = (d: Date) => {
    setSelectedDateKey(toLocalDateKey(d));
    onChange("");
  };

  // Generate bookable slots from the day's availability blocks.
  const slots = useMemo(() => {
    if (!dayAvail || dayAvail.slots.length === 0) return [];
    const bookedSet = new Set<string>();
    for (const bt of dayAvail.bookedTimes) {
      const b = new Date(bt);
      bookedSet.add(`${b.getHours()}:${b.getMinutes()}`);
    }

    const result: {
      start: Date;
      end: Date;
      label: string;
      booked: boolean;
    }[] = [];

    for (const block of dayAvail.slots) {
      const [sh, sm] = block.startTime.split(":").map(Number);
      const [eh, em] = block.endTime.split(":").map(Number);
      let startMins = sh * 60 + sm;
      // Round the first slot up to the nearest step for tidiness.
      startMins = roundToNext(startMins, SLOT_STEP_MINS);
      const endMins = eh * 60 + em;

      for (let t = startMins; t + durationMins <= endMins; t += SLOT_STEP_MINS) {
        const start = new Date(viewYear, viewMonth, Number(selectedDateKey.split("-")[2]), 0, 0, 0);
        start.setMinutes(t);
        const end = new Date(start.getTime());
        end.setMinutes(t + durationMins);

        const key = `${start.getHours()}:${start.getMinutes()}`;
        result.push({
          start,
          end,
          label: formatSlot(start, end),
          booked: bookedSet.has(key),
        });
      }
    }
    return result;
  }, [dayAvail, viewYear, viewMonth, selectedDateKey, durationMins]);

  const selectedMinutes = useMemo(() => {
    if (!value) return null;
    const d = new Date(value);
    return d.getHours() * 60 + d.getMinutes();
  }, [value]);

  const hasAvailabilityForSelectedDate = selectedDateKey
    ? coveredDays.has(new Date(viewYear, viewMonth, Number(selectedDateKey.split("-")[2])).getDay())
    : false;

  return (
    <div className="space-y-4 rounded-xl border p-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigateMonth(1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const key = toLocalDateKey(d);
          const disabled = isPast(d) || !coveredDays.has(d.getDay());
          const selected = key === selectedDateKey;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => selectDate(d)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md text-sm transition-colors",
                disabled &&
                  "cursor-not-allowed text-muted-foreground/30 hover:bg-transparent",
                !disabled &&
                  !selected &&
                  "text-foreground hover:bg-muted hover:text-primary",
                selected &&
                  "bg-primary font-semibold text-primary-foreground shadow",
                !coveredDays.has(d.getDay()) && "opacity-40"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted" /> Unavailable
        </span>
      </div>

      {/* Slot grid */}
      {selectedDateKey && (
        <div className="border-t pt-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {new Date(viewYear, viewMonth, Number(selectedDateKey.split("-")[2])).toLocaleDateString(
              "en-US",
              { weekday: "long", month: "short", day: "numeric" }
            )}
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading available slots...
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              Couldn't load availability for this date. Please try again.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {!hasAvailabilityForSelectedDate ? (
                <p className="py-3 text-sm text-muted-foreground">
                  The technician is not available on this day.
                </p>
              ) : slots.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">
                  No open slots left for this day.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((slot, idx) => {
                    const active = selectedMinutes !== null && selectedMinutes === slot.start.getHours() * 60 + slot.start.getMinutes();
                    return (
                      <button
                        key={`${slot.start.toISOString()}-${idx}`}
                        type="button"
                        disabled={slot.booked}
                        onClick={() => onChange(slot.start.toISOString())}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                          slot.booked &&
                            "cursor-not-allowed border-dashed bg-muted/50 text-muted-foreground/40 line-through",
                          !slot.booked &&
                            !active &&
                            "border-input hover:border-primary hover:text-primary",
                          active && "border-primary bg-primary text-primary-foreground shadow"
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function formatSlot(start: Date, end: Date): string {
  const fmt = (h: number, m: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
  };
  return `${fmt(start.getHours(), start.getMinutes())} – ${fmt(end.getHours(), end.getMinutes())}`;
}
