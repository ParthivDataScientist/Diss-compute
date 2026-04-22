"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { CalendarRange, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { brands, leadSources, salespeople, statuses } from "@/lib/constants";
import { leads } from "@/lib/mock-data";
import { formatCurrency, isOverdue } from "@/lib/utils";
import { ChartCard } from "@/components/analytics/chart-card";

type AnalyticsFilters = {
  dateFrom: string;
  dateTo: string;
  salesperson: string;
  brand: string;
  source: string;
};

type RankedBarConfig = {
  color?: string;
  suffix?: string;
  formatter?: "number" | "currency";
  maxItems?: number;
};

const initialAnalyticsFilters: AnalyticsFilters = {
  dateFrom: "",
  dateTo: "",
  salesperson: "All",
  brand: "All",
  source: "All"
};

const axisLabelStyle = {
  color: "#64748b",
  fontSize: 11
};

const grid = {
  left: 12,
  right: 12,
  top: 12,
  bottom: 8,
  containLabel: true
};

export function AnalyticsWorkspace() {
  const [filters, setFilters] = useState<AnalyticsFilters>(initialAnalyticsFilters);

  const filtered = useMemo(() => {
    return leads.filter(
      (lead) =>
        (filters.salesperson === "All" || lead.salesperson === filters.salesperson) &&
        (filters.brand === "All" || lead.brandInterested === filters.brand) &&
        (filters.source === "All" || lead.leadSource === filters.source) &&
        (!filters.dateFrom || lead.createdAt >= filters.dateFrom) &&
        (!filters.dateTo || lead.createdAt <= filters.dateTo)
    );
  }, [filters]);

  const wonCount = filtered.filter((lead) => lead.status === "Won").length;
  const lostCount = filtered.filter((lead) => lead.status === "Lost").length;
  const openLeads = filtered.filter((lead) => !["Won", "Lost"].includes(lead.status));
  const overdueLeads = openLeads.filter((lead) => isOverdue(lead.nextFollowUpDate));
  const totalBudget = filtered.reduce((sum, lead) => sum + lead.budget, 0);
  const winRate = filtered.length ? Math.round((wonCount / filtered.length) * 100) : 0;
  const lossRate = filtered.length ? Math.round((lostCount / filtered.length) * 100) : 0;
  const qualifiedCount = filtered.filter((lead) => ["Hot", "Warm", "Won"].includes(lead.status)).length;
  const hotCount = filtered.filter((lead) => ["Hot", "Won"].includes(lead.status)).length;

  const funnelStages = useMemo(
    () => [
      { label: "All leads", value: filtered.length },
      { label: "Qualified", value: qualifiedCount },
      { label: "High intent", value: hotCount },
      { label: "Won", value: wonCount }
    ],
    [filtered.length, hotCount, qualifiedCount, wonCount]
  );

  const leadsByDate = useMemo(() => {
    return filtered.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.createdAt] = (acc[lead.createdAt] ?? 0) + 1;
      return acc;
    }, {});
  }, [filtered]);

  const leadTrendEntries = useMemo(
    () =>
      Object.entries(leadsByDate)
        .sort((left, right) => left[0].localeCompare(right[0]))
        .slice(-7),
    [leadsByDate]
  );

  const statusCounts = useMemo(
    () =>
      statuses.reduce<Record<string, number>>((acc, status) => {
        acc[status] = filtered.filter((lead) => lead.status === status).length;
        return acc;
      }, {}),
    [filtered]
  );

  const leadsBySalesperson = useMemo(() => countBy(filtered.map((lead) => lead.salesperson)), [filtered]);
  const conversionRates = useMemo(() => {
    return Object.fromEntries(
      salespeople.map((name) => {
        const owned = filtered.filter((lead) => lead.salesperson === name);
        const won = owned.filter((lead) => lead.status === "Won").length;
        return [name, owned.length ? Math.round((won / owned.length) * 100) : 0];
      })
    );
  }, [filtered]);

  const productDemand = useMemo(
    () => countBy(filtered.map((lead) => `${lead.brandInterested} ${lead.laptopModel}`)),
    [filtered]
  );

  const sourceCounts = useMemo(() => countBy(filtered.map((lead) => lead.leadSource)), [filtered]);

  const activeFilterCount =
    [filters.salesperson, filters.brand, filters.source].filter((value) => value !== "All").length +
    Number(Boolean(filters.dateFrom || filters.dateTo));
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Analytics</h1>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-100 px-3 text-[12px] font-semibold text-slate-600">
            <SlidersHorizontal size={14} />
            {`Filters (${activeFilterCount})`}
          </div>

          <div className="flex h-9 min-w-[240px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
            <CalendarRange size={14} className="shrink-0 text-gray-400" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })}
              className="w-[104px] bg-transparent text-[12px] font-medium text-gray-600 outline-none"
            />
            <span className="text-[12px] font-medium text-gray-400">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })}
              className="w-[104px] bg-transparent text-[12px] font-medium text-gray-600 outline-none"
            />
            {(filters.dateFrom || filters.dateTo) && (
              <button
                type="button"
                onClick={() => setFilters({ ...filters, dateFrom: "", dateTo: "" })}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors duration-200 hover:bg-slate-100 hover:text-gray-600"
                aria-label="Clear date range"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <AnalyticsSelect
            label="Salesperson"
            value={filters.salesperson}
            options={["All", ...salespeople]}
            onChange={(value) => setFilters({ ...filters, salesperson: value })}
          />
          <AnalyticsSelect
            label="Brand"
            value={filters.brand}
            options={["All", ...brands]}
            onChange={(value) => setFilters({ ...filters, brand: value })}
          />
          <AnalyticsSelect
            label="Lead Source"
            value={filters.source}
            options={["All", ...leadSources]}
            onChange={(value) => setFilters({ ...filters, source: value })}
          />
          <button
            type="button"
            onClick={() => setFilters(initialAnalyticsFilters)}
            disabled={!hasActiveFilters}
            className={`h-9 rounded-lg px-3 text-[12px] font-semibold transition-colors duration-200 ${
              hasActiveFilters
                ? "text-gray-600 hover:bg-slate-100 hover:text-ink"
                : "cursor-not-allowed text-gray-400"
            }`}
          >
            Clear
          </button>
        </div>
      </div>

      <AnalyticsSection title="Executive Summary" />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric
          label="Pipeline Leads"
          value={filtered.length.toString()}
          note={`${qualifiedCount} qualified leads in the active view`}
        />
        <Metric
          label="Win Rate"
          value={`${winRate}%`}
          note={`${wonCount} converted leads`}
          accent="text-accent-700"
        />
        <Metric
          label="Loss Rate"
          value={`${lossRate}%`}
          note={`${lostCount} lost leads`}
        />
        <Metric
          label="Overdue Follow-ups"
          value={overdueLeads.length.toString()}
          note={totalBudget ? `${formatCurrency(totalBudget)} visible pipeline value` : "No active pipeline value"}
          accent={overdueLeads.length > 0 ? "text-status-red-700" : "text-ink"}
        />
      </div>

      <AnalyticsSection title="Conversion & Trend" />
      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <ChartCard
          title="Conversion funnel"
          option={buildFunnelOption(funnelStages)}
          height={360}
        />
        <ChartCard
          title="Leads over time"
          option={buildLineOption(
            leadTrendEntries.map(([date]) =>
              new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(date))
            ),
            leadTrendEntries.map(([, value]) => value)
          )}
          height={320}
        />
      </div>

      <ChartCard
        title="Lead status breakdown"
        option={buildSegmentedStatusOption(statusCounts)}
        height={120}
      />

      <AnalyticsSection title="Performance" />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Salesperson pipeline volume"
          option={buildRankedBarOption(leadsBySalesperson, { color: "#0f172a", maxItems: salespeople.length })}
        />
        <ChartCard
          title="Conversion rate by salesperson"
          option={buildRankedBarOption(conversionRates, {
            color: "#2563eb",
            suffix: "%",
            maxItems: salespeople.length
          })}
        />
      </div>

      <AnalyticsSection title="Product Insights" />
      <ChartCard
        title="Top requested products"
        option={buildRankedBarOption(productDemand, { maxItems: 5 })}
      />

      <AnalyticsSection title="Source Analysis" />
      <ChartCard
        title="Lead sources"
        option={buildRankedBarOption(sourceCounts)}
      />
    </div>
  );
}

function AnalyticsSection({ title }: { title: string }) {
  return (
    <div className="pt-2">
      <h2 className="text-[16px] font-semibold tracking-tight text-ink">{title}</h2>
    </div>
  );
}

function AnalyticsSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative min-w-[132px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-[13px] font-medium text-gray-700 outline-none transition-all duration-200 hover:border-slate-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
      >
        {options.map((option) => (
          <option key={option}>{option === "All" ? label : option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </label>
  );
}

function Metric({
  label,
  value,
  note,
  accent
}: {
  label: string;
  value: string;
  note: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <p className="text-[12px] font-medium text-slate-500">{label}</p>
      <p className={`mt-3 text-[30px] font-bold tracking-tight ${accent ?? "text-ink"}`}>{value}</p>
      <p className="mt-2 text-[12px] text-slate-500">{note}</p>
    </div>
  );
}

function countBy(items: string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

function buildFunnelOption(stages: { label: string; value: number }[]): EChartsOption {
  return {
    animationDuration: 220,
    tooltip: {
      trigger: "item"
    },
    series: [
      {
        type: "funnel",
        left: "8%",
        width: "84%",
        top: 20,
        bottom: 16,
        sort: "descending",
        gap: 3,
        minSize: "20%",
        maxSize: "100%",
        label: {
          color: "#0f172a",
          fontSize: 12,
          fontWeight: 600,
          formatter: ({ name, value }) => `${name}\n${value}`
        },
        itemStyle: {
          borderColor: "#ffffff",
          borderWidth: 2
        },
        data: stages.map((stage, index) => ({
          name: stage.label,
          value: stage.value,
          itemStyle: {
            color: ["#dbeafe", "#bfdbfe", "#93c5fd", "#2563eb"][index]
          }
        }))
      }
    ]
  };
}

function buildSegmentedStatusOption(statusCounts: Record<string, number>): EChartsOption {
  const colors: Record<string, string> = {
    Hot: "#94a3b8",
    Warm: "#cbd5e1",
    Cold: "#e2e8f0",
    Won: "#2563eb",
    Lost: "#ef4444"
  };

  return {
    animationDuration: 220,
    grid: { left: 0, right: 0, top: 10, bottom: 10, containLabel: true },
    tooltip: {
      trigger: "item"
    },
    xAxis: {
      type: "value",
      show: false
    },
    yAxis: {
      type: "category",
      data: ["Pipeline"],
      show: false
    },
    series: statuses.map((status) => ({
      name: status,
      type: "bar",
      stack: "status",
      data: [
        {
          value: statusCounts[status] ?? 0,
          itemStyle: {
            color: colors[status],
            borderRadius: status === "Hot" ? [6, 0, 0, 6] : status === "Lost" ? [0, 6, 6, 0] : 0
          }
        }
      ],
      label: {
        show: (statusCounts[status] ?? 0) > 0,
        position: "inside",
        color: status === "Cold" ? "#475569" : "#ffffff",
        fontSize: 11,
        formatter: () => status
      },
      barWidth: 34
    }))
  };
}

function buildRankedBarOption(data: Record<string, number>, config?: RankedBarConfig): EChartsOption {
  const entries = Object.entries(data)
    .sort((left, right) => right[1] - left[1])
    .slice(0, config?.maxItems ?? 7);

  return {
    animationDuration: 220,
    grid,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "none" },
      valueFormatter: (value) => formatTooltipValue(Number(value), config)
    },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: axisLabelStyle,
      splitLine: { lineStyle: { color: "#f1f5f9" } }
    },
    yAxis: {
      type: "category",
      data: entries.map(([label]) => label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: axisLabelStyle
    },
    series: [
      {
        type: "bar",
        barMaxWidth: 18,
        data: entries.map(([, value], index) => ({
          value,
          itemStyle: {
            color: index === 0 ? config?.color ?? "#2563eb" : "#cbd5e1",
            borderRadius: [0, 6, 6, 0]
          }
        })),
        label: {
          show: true,
          position: "right",
          color: "#334155",
          fontSize: 11,
          formatter: ({ value }) => formatTooltipValue(Number(value), config)
        }
      }
    ]
  };
}

function buildLineOption(labels: string[], values: number[]): EChartsOption {
  return {
    animationDuration: 220,
    color: ["#2563eb"],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        lineStyle: { color: "#cbd5e1" }
      }
    },
    grid: { ...grid, bottom: 24 },
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisTick: { show: false },
      axisLabel: axisLabelStyle
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: axisLabelStyle,
      splitLine: { lineStyle: { color: "#f1f5f9" } }
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: values,
        lineStyle: { width: 3 },
        itemStyle: { color: "#2563eb", borderColor: "#ffffff", borderWidth: 2 },
        areaStyle: { color: "rgba(37, 99, 235, 0.08)" }
      }
    ]
  };
}

function formatTooltipValue(value: number, config?: RankedBarConfig) {
  if (config?.formatter === "currency") {
    return formatCurrency(value);
  }

  if (config?.suffix) {
    return `${value}${config.suffix}`;
  }

  return value.toString();
}
