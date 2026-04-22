"use client";

import { CalendarRange, Filter, Search, X } from "lucide-react";
import { brands, leadSources, priorities, salespeople, statuses } from "@/lib/constants";
import type { LeadStatus, Priority } from "@/lib/types";

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

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const setFilter = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.query ||
    filters.status !== "All" ||
    filters.priority !== "All" ||
    filters.salesperson !== "All" ||
    filters.brand !== "All" ||
    filters.source !== "All" ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="rounded-xl border border-line bg-white p-3 shadow-card space-y-2">
      {/* Row 1: Search + Date Range */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            value={filters.query}
            onChange={(event) => setFilter("query", event.target.value)}
            className="h-9 w-full rounded-lg border border-transparent bg-gray-50 pl-9 pr-3 text-[13px] outline-none transition-colors hover:bg-gray-100 focus:border-accent-500 focus:bg-white focus:ring-1 focus:ring-accent-500 placeholder:text-gray-400"
            placeholder="Search customer, model, note..."
          />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-gray-50 px-3 h-9">
            <CalendarRange size={14} className="text-gray-400 shrink-0" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilter("dateFrom", e.target.value)}
              className="bg-transparent text-[12px] font-medium text-gray-600 outline-none w-[120px] cursor-pointer"
            />
          </div>
          <span className="text-[12px] font-medium text-gray-400">→</span>
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-gray-50 px-3 h-9">
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilter("dateTo", e.target.value)}
              className="bg-transparent text-[12px] font-medium text-gray-600 outline-none w-[120px] cursor-pointer"
            />
          </div>
          {(filters.dateFrom || filters.dateTo) && (
            <button
              onClick={() => onChange({ ...filters, dateFrom: "", dateTo: "" })}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="Clear date range"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Dropdowns + Reset */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5 lg:flex flex-1">
          <Select label="Status" value={filters.status} onChange={(value) => setFilter("status", value as LeadFilters["status"])} options={["All", ...statuses]} />
          <Select label="Salesperson" value={filters.salesperson} onChange={(value) => setFilter("salesperson", value)} options={["All", ...salespeople]} />
          <Select label="Priority" value={filters.priority} onChange={(value) => setFilter("priority", value as LeadFilters["priority"])} options={["All", ...priorities]} />
          <Select label="Source" value={filters.source} onChange={(value) => setFilter("source", value)} options={["All", ...leadSources]} />
          <Select label="Brand" value={filters.brand} onChange={(value) => setFilter("brand", value)} options={["All", ...brands]} />
        </div>

        <button
          type="button"
          onClick={() => onChange(initialFilters)}
          className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors ${
            hasActiveFilters
              ? "border-accent-300 bg-accent-50 text-accent-700 hover:bg-accent-100"
              : "border-line text-gray-600 hover:bg-gray-50 hover:text-ink"
          }`}
        >
          <Filter size={14} />
          {hasActiveFilters ? "Clear All" : "Reset"}
        </button>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="relative flex-1 lg:min-w-[120px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-8 text-[13px] font-medium text-gray-600 outline-none transition-colors hover:bg-gray-50 focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
      >
        <option value="All">{label}</option>
        {options.filter(o => o !== "All").map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </label>
  );
}
