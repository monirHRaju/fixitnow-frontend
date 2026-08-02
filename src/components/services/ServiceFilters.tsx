"use client";

import { useState } from "react";
import { SlidersHorizontal, Star, X, Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FiltersState {
  searchTerm: string;
  selectedCategory: string | null;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  location: string;
  sort: string;
}

interface ServiceFiltersProps {
  categories: { id: string; name: string; _count?: { services: number } }[];
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
  onClearAll: () => void;
}

const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "4", label: "4+ stars" },
  { value: "3", label: "3+ stars" },
  { value: "2", label: "2+ stars" },
  { value: "1", label: "1+ star" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export default function ServiceFilters({
  categories,
  filters,
  onFilterChange,
  onClearAll,
}: ServiceFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const updateFilter = (key: keyof FiltersState, value: string | null) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = () => {
    return (
      filters.selectedCategory !== null ||
      filters.minPrice !== "" ||
      filters.maxPrice !== "" ||
      filters.minRating !== "" ||
      filters.location !== "" ||
      filters.sort !== "newest"
    );
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              ৳
            </span>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
              className="pl-7 text-sm"
              min={0}
            />
          </div>
          <span className="text-muted-foreground">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              ৳
            </span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              className="pl-7 text-sm"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          Minimum Rating
        </h4>
        <Select
          value={filters.minRating}
          onValueChange={(value) => updateFilter("minRating", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  {opt.value ? (
                    <>
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {opt.label}
                    </>
                  ) : (
                    opt.label
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Search */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">Location</h4>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by location..."
            value={filters.location}
            onChange={(e) => updateFilter("location", e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">Sort By</h4>
        <Select
          value={filters.sort}
          onValueChange={(value) => updateFilter("sort", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Newest" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter (inside the filter panel for mobile) */}
      <div className="md:hidden">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Category</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter("selectedCategory", null)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filters.selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter("selectedCategory", cat.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filters.selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {cat.name}
              {cat._count?.services !== undefined && (
                <span className="ml-1 opacity-70">
                  ({cat._count.services})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Clear All */}
      {hasActiveFilters() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="w-full text-muted-foreground"
        >
          <X className="mr-1 h-4 w-4" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="mb-4 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="w-full"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters() && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Filters (collapsible) */}
      {mobileFiltersOpen && (
        <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm md:hidden">
          {filterContent}
        </div>
      )}

      {/* Desktop Filters (sidebar) */}
      <div className="hidden md:block">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </h3>
          {filterContent}
        </div>
      </div>
    </>
  );
}