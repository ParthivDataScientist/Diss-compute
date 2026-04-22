"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarRange, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { brands, leadSources, priorities, salespeople, statuses } from "@/lib/constants";
import type { LeadStatus, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

export type LeadFilters = {
  query: string;
  status: LeadStatus | "All";
  priority: Priority | "All";
  salesperson: string;
  brand: string;
  source: string;
  dateFrom: string;
  dateTo: string;
};

export const initialFilters: LeadFilters = {
  query: "",
  status: "All",
  priority: "All",
  salesperson: "All",
  brand: "All",
  source: "All",
  dateFrom: "",
  dateTo: ""
};

type FilterBarProps = {
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
};

type SelectFilterKey = "status" | "priority" | "salesperson" | "brand" | "source";

const compactSelectConfig: { key: SelectFilterKey; label: string; options: string[] }[] = [
  { key: "status", label: "Status", options: ["All", ...statuses] },
  { key: "priority", label: "Priority", options: ["All", ...priorities] },
  { key: "salesperson", label: "Salesperson", options: ["All", ...salespeople] }
];

const extraSelectConfig: { key: SelectFilterKey; label: string; options: string[] }[] = [
  { key: "source", label: "Source", options: ["All", ...leadSources] },
  { key: "brand", label: "Brand", options: ["All", ...brands] }
];

const filterKeys: (keyof LeadFilters)[] = [
  "query",
  "status",
  "priority",
  "salesperson",
  "brand",
  "source",
  "dateFrom",
  "dateTo"
];

function getActiveFilterCount(filters: LeadFilters) {
  let count = 0;
  if (filters.status !== "All") count += 1;
  if (filters.priority !== "All") count += 1;
  if (filters.salesperson !== "All") count += 1;
  if (filters.brand !== "All") count += 1;
  if (filters.source !== "All") count += 1;
  if (filters.dateFrom || filters.dateTo) count += 1;
  return count;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [draftFilters, setDraftFilters] = useState<LeadFilters>(filters);
  const [showExtraFilters, setShowExtraFilters] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const setFilter = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const hasPendingChanges = useMemo(
    () => filterKeys.some((key) => draftFilters[key] !== filters[key]),
    [draftFilters, filters]
  );

  const activeFilterCount = useMemo(() => getActiveFilterCount(draftFilters), [draftFilters]);
  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0 || Boolean(draftFilters.query.trim());
  }, [activeFilterCount, draftFilters.query]);

  const applyFilters = () => {
    onChange(draftFilters);
    setShowMobileSheet(false);
  };

  const clearAll = () => {
    setDraftFilters(initialFilters);
    setShowExtraFilters(false);
    onChange(initialFilters);
    setShowMobileSheet(false);
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={draftFilters.query}
              onChange={(event) => setFilter("query", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters();
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[14px] text-gray-700 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
              placeholder="Search customer or note..."
            />
          </div>
          <button
            type="button"
            onClick={() => setShowMobileSheet(true)}
            className="inline-flex h-11 min-w-[92px] items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-[13px] font-semibold text-slate-700 transition-colors active:bg-slate-50"
          >
            <SlidersHorizontal size={16} />
            {`Filters (${activeFilterCount})`}
          </button>
        </div>

        <div className="hidden flex-wrap items-center gap-2 lg:flex">
          <div className="relative min-w-[220px] flex-[1_1_320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              value={draftFilters.query}
              onChange={(event) => setFilter("query", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters();
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-gray-700 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-slate-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
              placeholder="Search customer, model, note..."
            />
          </div>

          {compactSelectConfig.map((config) => (
            <SelectField
              key={config.key}
              label={config.label}
              value={draftFilters[config.key]}
              onChange={(value) => setFilter(config.key, value as LeadFilters[typeof config.key])}
              options={config.options}
              className="w-[132px]"
            />
          ))}

          <DateRangeField
            dateFrom={draftFilters.dateFrom}
            dateTo={draftFilters.dateTo}
            onDateFromChange={(value) => setFilter("dateFrom", value)}
            onDateToChange={(value) => setFilter("dateTo", value)}
            onClear={() => {
              setFilter("dateFrom", "");
              setFilter("dateTo", "");
            }}
          />

          <button
            type="button"
            onClick={() => setShowExtraFilters((prev) => !prev)}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-semibold transition-colors duration-200",
              showExtraFilters
                ? "border-slate-300 bg-slate-100 text-slate-700"
                : "border-slate-200 bg-white text-gray-600 hover:border-slate-300 hover:text-ink"
            )}
            aria-expanded={showExtraFilters}
          >
            <SlidersHorizontal size={14} />
            {`+ Filters (${activeFilterCount})`}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={applyFilters}
              disabled={!hasPendingChanges}
              className={cn(
                "h-10 rounded-lg px-4 text-[13px] font-semibold transition-colors duration-200",
                hasPendingChanges
                  ? "bg-accent-600 text-white hover:bg-accent-700"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              )}
            >
              Apply
            </button>

            <button
              type="button"
              onClick={clearAll}
              disabled={!hasActiveFilters && !hasPendingChanges}
              className={cn(
                "h-10 rounded-lg px-3 text-[12px] font-semibold transition-colors duration-200",
                hasActiveFilters || hasPendingChanges
                  ? "text-gray-600 hover:bg-slate-100 hover:text-ink"
                  : "cursor-not-allowed text-gray-400"
              )}
            >
              Clear
            </button>
          </div>
        </div>

        {showExtraFilters && (
          <div className="mt-3 hidden gap-2 border-t border-slate-200 pt-3 lg:grid lg:grid-cols-2">
            {extraSelectConfig.map((config) => (
              <SelectField
                key={config.key}
                label={config.label}
                value={draftFilters[config.key]}
                onChange={(value) => setFilter(config.key, value as LeadFilters[typeof config.key])}
                options={config.options}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/30 transition-opacity lg:hidden",
          showMobileSheet ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setShowMobileSheet(false)}
      />

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-white px-4 pb-5 pt-4 shadow-[0_-16px_48px_rgba(15,23,42,0.18)] transition-transform duration-200 lg:hidden",
          showMobileSheet ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-slate-900">Filters</h2>
            <p className="mt-1 text-[12px] text-slate-500">{activeFilterCount} active filters</p>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileSheet(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 active:bg-slate-100"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {compactSelectConfig.map((config) => (
            <SelectField
              key={config.key}
              label={config.label}
              value={draftFilters[config.key]}
              onChange={(value) => setFilter(config.key, value as LeadFilters[typeof config.key])}
              options={config.options}
            />
          ))}

          {extraSelectConfig.map((config) => (
            <SelectField
              key={config.key}
              label={config.label}
              value={draftFilters[config.key]}
              onChange={(value) => setFilter(config.key, value as LeadFilters[typeof config.key])}
              options={config.options}
            />
          ))}

          <DateRangeField
            dateFrom={draftFilters.dateFrom}
            dateTo={draftFilters.dateTo}
            onDateFromChange={(value) => setFilter("dateFrom", value)}
            onDateToChange={(value) => setFilter("dateTo", value)}
            onClear={() => {
              setFilter("dateFrom", "");
              setFilter("dateTo", "");
            }}
            mobile
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={clearAll}
            className="h-11 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 active:bg-slate-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="h-11 rounded-xl bg-slate-900 text-[13px] font-semibold text-white active:bg-slate-800"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

function DateRangeField({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  mobile
}: {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
  mobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3",
        mobile ? "h-auto flex-col items-stretch rounded-xl p-3" : "h-10 min-w-[240px]"
      )}
    >
      <div className={cn("flex items-center gap-2", mobile && "mb-2")}>
        <CalendarRange size={14} className="shrink-0 text-gray-400" />
        {mobile ? <span className="text-[12px] font-medium text-slate-500">Date range</span> : null}
      </div>
      <div className={cn("flex items-center gap-2", mobile && "flex-col items-stretch")}>
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
          className={cn(
            "bg-transparent font-medium text-gray-600 outline-none",
            mobile ? "h-10 rounded-lg border border-slate-200 px-3 text-[13px]" : "w-[104px] text-[12px]"
          )}
        />
        <span className="text-[12px] font-medium text-gray-400">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
          className={cn(
            "bg-transparent font-medium text-gray-600 outline-none",
            mobile ? "h-10 rounded-lg border border-slate-200 px-3 text-[13px]" : "w-[104px] text-[12px]"
          )}
        />
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors duration-200 hover:bg-slate-100 hover:text-gray-600"
            title="Clear date range"
            aria-label="Clear date range"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  className
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <label className={cn("relative min-w-[124px]", className)}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-[13px] font-medium text-gray-700 outline-none transition-all duration-200 hover:border-slate-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 lg:h-10 lg:rounded-lg"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? label : option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </label>
  );
}
