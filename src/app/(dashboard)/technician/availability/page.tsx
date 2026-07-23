"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save } from "lucide-react";
import { technicianApi } from "@/lib/api";
import type { AvailabilitySlot } from "@/lib/types";
import { getDayName, DAYS } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface DaySlots {
  dayOfWeek: number;
  slots: { startTime: string; endTime: string }[];
}

const defaultSlots: DaySlots[] = DAYS.map((d) => ({
  dayOfWeek: d.value,
  slots: [],
}));

export default function TechnicianAvailabilityPage() {
  const [availability, setAvailability] = useState<DaySlots[]>(defaultSlots);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAvailability = useCallback(async () => {
    try {
      const userId = useAuthStore.getState().user?.technicianProfile?.id;
      if (!userId) {
        setLoading(false);
        return;
      }
      const res = await technicianApi.getById(userId);
      const slots = res.data?.technician?.availability || [];
      if (slots.length > 0) {
        setAvailability((prev) =>
          prev.map((day) => ({
            ...day,
            slots: slots
              .filter((s: AvailabilitySlot) => s.dayOfWeek === day.dayOfWeek)
              .map((s: AvailabilitySlot) => ({
                startTime: s.startTime,
                endTime: s.endTime,
              })),
          }))
        );
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  function getDaySlots(dayOfWeek: number) {
    return (
      availability.find((a) => a.dayOfWeek === dayOfWeek) || {
        dayOfWeek,
        slots: [],
      }
    );
  }

  function addSlot(dayOfWeek: number) {
    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              slots: [
                ...day.slots,
                { startTime: "09:00", endTime: "17:00" },
              ],
            }
          : day
      )
    );
  }

  function removeSlot(dayOfWeek: number, slotIndex: number) {
    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              slots: day.slots.filter((_, i) => i !== slotIndex),
            }
          : day
      )
    );
  }

  function updateSlotTime(
    dayOfWeek: number,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) {
    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              slots: day.slots.map((slot, i) =>
                i === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : day
      )
    );
  }

  async function handleSave() {
    const slots = availability.flatMap((day) =>
      day.slots.map((slot) => ({
        dayOfWeek: day.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }))
    );

    if (slots.length === 0) {
      toast.error("Add at least one availability slot");
      return;
    }

    setSaving(true);
    try {
      await technicianApi.updateAvailability(slots);
      toast.success("Availability updated successfully");
    } catch {
      toast.error("Failed to update availability");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set your weekly working hours
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save All"}
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {DAYS.map((day, dayIndex) => {
          const daySlots = getDaySlots(day.value);
          return (
            <motion.div
              key={day.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{day.label}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addSlot(day.value)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Slot
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {daySlots.slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No slots set for {day.label}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {daySlots.slots.map((slot, slotIndex) => (
                        <div
                          key={slotIndex}
                          className="flex items-center gap-2"
                        >
                          <div className="flex-1">
                            <Label className="text-xs sr-only">
                              Start Time
                            </Label>
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) =>
                                updateSlotTime(
                                  day.value,
                                  slotIndex,
                                  "startTime",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <span className="text-muted-foreground text-sm">
                            to
                          </span>
                          <div className="flex-1">
                            <Label className="text-xs sr-only">
                              End Time
                            </Label>
                            <Input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) =>
                                updateSlotTime(
                                  day.value,
                                  slotIndex,
                                  "endTime",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive shrink-0"
                            onClick={() => removeSlot(day.value, slotIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}