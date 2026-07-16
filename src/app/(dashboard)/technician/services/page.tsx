"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  Tag,
  DollarSign,
} from "lucide-react";
import { serviceApi, categoryApi } from "@/lib/api";
import type { ServiceItem, Category } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ServiceFormData {
  title: string;
  categoryId: string;
  description: string;
  price: string;
  durationMins: string;
}

const emptyForm: ServiceFormData = {
  title: "",
  categoryId: "",
  description: "",
  price: "",
  durationMins: "",
};

export default function TechnicianServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const res = await serviceApi.listMyServices(true);
      setServices(res.data.services || []);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.list();
      setCategories(res.data.categories || []);
    } catch {
      // silently handle
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchServices(), fetchCategories()]);
  }, [fetchServices, fetchCategories]);

  function openCreateDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(service: ServiceItem) {
    setEditingId(service.id);
    setForm({
      title: service.title,
      categoryId: service.categoryId,
      description: service.description || "",
      price: String(service.price),
      durationMins: String(service.durationMins || ""),
    });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.categoryId || !form.price) {
      toast.error("Please fill in required fields");
      return;
    }
    setSaving(true);
    try {
      const data = {
        title: form.title,
        categoryId: form.categoryId,
        description: form.description || undefined,
        price: Number(form.price),
        durationMins: form.durationMins ? Number(form.durationMins) : undefined,
      };

      if (editingId) {
        await serviceApi.update(editingId, data);
        toast.success("Service updated");
      } else {
        await serviceApi.create(data);
        toast.success("Service created");
      }
      setDialogOpen(false);
      fetchServices();
    } catch {
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(service: ServiceItem) {
    try {
      await serviceApi.update(service.id, { isActive: !service.isActive });
      toast.success(service.isActive ? "Service deactivated" : "Service activated");
      fetchServices();
    } catch {
      toast.error("Failed to update service");
    }
  }

  async function handleDelete(service: ServiceItem) {
    try {
      await serviceApi.update(service.id, { isActive: false });
      toast.success("Service removed");
      fetchServices();
    } catch {
      toast.error("Failed to remove service");
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Services</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the services you offer
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t added any services yet
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={cn(
                  "h-full relative overflow-hidden",
                  !service.isActive && "opacity-60"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">
                        {service.title}
                      </h3>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {service.category?.name || "Uncategorized"}
                      </Badge>
                    </div>
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={() => handleToggleActive(service)}
                    />
                  </div>

                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      {formatCurrency(service.price)}
                    </span>
                    {service.durationMins && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {service.durationMins} min
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(service)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(service)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Service" : "Add Service"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update your service details"
                : "Create a new service to offer"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="e.g. Kitchen Sink Repair"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe what this service includes..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (BDT) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  placeholder="e.g. 150000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (mins)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={0}
                  value={form.durationMins}
                  onChange={(e) =>
                    setForm({ ...form, durationMins: e.target.value })
                  }
                  placeholder="e.g. 60"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Service"
                  : "Create Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
