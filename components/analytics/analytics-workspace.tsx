"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { brands, leadSources, salespeople, statusStyles, statuses } from "@/lib/constants";
import { leads } from "@/lib/mock-data";
import { formatCurrency, isOverdue } from "@/lib/utils";
import { ChartCard } from "@/components/analytics/chart-card";
import { SectionCard } from "@/components/ui/section-card";
import { CalendarRange, X } from "lucide-react";

type AnalyticsFilters = {
  dateFrom: string;
  dateTo: string;
  salesperson: string;
  brand: string;
  source: string;
};

export function AnalyticsWorkspace() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateFrom: "",
    dateTo: "",
    salesperson: "All",
    brand: "All",
    source: "All"
  });

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

  const countBy = (items: string[]) => items.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item]: (acc[item] ?? 0) + 1 }), {});
  const sumBudgetBy = (key: "salesperson" | "brandInterested" | "leadSource") =>
    filtered.reduce<Record<string, number>>((acc, lead) => ({ ...acc, [lead[key]]: (acc[lead[key]] ?? 0) + lead.budget }), {});

  const statusDistribution: EChartsOption = {
    color: statuses.map((status) => statusStyles[status].chart),
    tooltip: { trigger: "item" },
    legend: { bottom: 0, icon: "circle" },
    series: [
      {
        name: "Leads",
        type: "pie",
        radius: ["52%", "72%"],
        center: ["50%", "44%"],
        data: statuses.map((status) => ({ name: status, value: filtered.filter((lead) => lead.status === status).length })),
        label: { formatter: "{b}", color: "#374151" }
      }
    ]
  };

  const leadsOverTime: EChartsOption = {
    color: ["#2563eb"],
    tooltip: { trigger: "axis" },
    grid: { left: 36, right: 18, top: 24, bottom: 36 },
    xAxis: { type: "category", data: ["Apr 12", "Apr 15", "Apr 17", "Apr 18", "Apr 19", "Apr 21", "Apr 22"], axisLine: { lineStyle: { color: "#e5e7eb" } } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: "#eef0f3" } } },
    series: [{ type: "line", smooth: true, data: [1, 2, 3, 4, 5, 7, 8], areaStyle: { color: "rgba(37, 99, 235, 0.10)" } }]
  };

  const funnel: EChartsOption = {
    color: ["#ef4444", "#f97316", "#2563eb", "#16a34a"],
    tooltip: { trigger: "item" },
    series: [
      {
        type: "funnel",
        left: "8%",
        top: 20,
        bottom: 20,
        width: "84%",
        sort: "descending",
        label: { color: "#111827", fontWeight: 600 },
        data: [
          { name: "Total", value: filtered.length },
          { name: "Qualified", value: filtered.filter((lead) => ["Hot", "Warm", "Won"].includes(lead.status)).length },
          { name: "Hot", value: filtered.filter((lead) => lead.status === "Hot").length },
          { name: "Won", value: filtered.filter((lead) => lead.status === "Won").length }
        ]
      }
    ]
  };

  const salespersonCounts = countBy(filtered.map((lead) => lead.salesperson));
  const salespersonRevenue = sumBudgetBy("salesperson");
  const brandCounts = countBy(filtered.map((lead) => lead.brandInterested));
  const modelCounts = countBy(filtered.map((lead) => lead.laptopModel));
  const useCaseCounts = countBy(filtered.map((lead) => lead.useCase));
  const sourceCounts = countBy(filtered.map((lead) => lead.leadSource));

  const barOption = (data: Record<string, number>, color = "#2563eb"): EChartsOption => ({
    color: [color],
    tooltip: { trigger: "axis" },
    grid: { left: 42, right: 18, top: 24, bottom: 48 },
    xAxis: { type: "category", data: Object.keys(data), axisLabel: { rotate: Object.keys(data).length > 4 ? 20 : 0 }, axisLine: { lineStyle: { color: "#e5e7eb" } } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: "#eef0f3" } } },
    series: [{ type: "bar", data: Object.values(data), barMaxWidth: 34, itemStyle: { borderRadius: [4, 4, 0, 0] } }]
  });

  const budgetBuckets = {
    "<50k": filtered.filter((lead) => lead.budget < 50000).length,
    "50k-75k": filtered.filter((lead) => lead.budget >= 50000 && lead.budget < 75000).length,
    "75k-1L": filtered.filter((lead) => lead.budget >= 75000 && lead.budget < 100000).length,
    "1L+": filtered.filter((lead) => lead.budget >= 100000).length
  };

  const totalBudget = filtered.reduce((sum, lead) => sum + lead.budget, 0);
  const hotOverdue = filtered.filter((lead) => lead.status === "Hot" && isOverdue(lead.nextFollowUpDate)).length;
  const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No brand";
  const bestSalesperson =
    salespeople
      .map((name) => {
        const owned = filtered.filter((lead) => lead.salesperson === name);
        const won = owned.filter((lead) => lead.status === "Won").length;
        return { name, rate: owned.length ? Math.round((won / owned.length) * 100) : 0 };
      })
      .sort((a, b) => b.rate - a.rate)[0] ?? null;
  const conversionRates = Object.fromEntries(
    salespeople.map((name) => {
      const owned = filtered.filter((lead) => lead.salesperson === name);
      const won = owned.filter((lead) => lead.status === "Won").length;
      return [name, owned.length ? Math.round((won / owned.length) * 100) : 0];
    })
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Analytics</h1>
          <p className="mt-1 text-sm text-muted">Track demand, salesperson outcomes, and follow-up risk without crowding the daily leads table.</p>
        </div>
      </div>

      <SectionCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
          {/* Date range */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Date range</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-line bg-gray-50 px-3 h-9">
                <CalendarRange size={14} className="text-gray-400 shrink-0" />
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="bg-transparent text-[12px] font-medium text-gray-600 outline-none w-[120px] cursor-pointer"
                />
              </div>
              <span className="text-[12px] font-medium text-gray-400">→</span>
              <div className="flex items-center gap-1.5 rounded-lg border border-line bg-gray-50 px-3 h-9">
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="bg-transparent text-[12px] font-medium text-gray-600 outline-none w-[120px] cursor-pointer"
                />
              </div>
              {(filters.dateFrom || filters.dateTo) && (
                <button
                  onClick={() => setFilters({ ...filters, dateFrom: "", dateTo: "" })}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
          <FilterSelect label="Salesperson" value={filters.salesperson} options={["All", ...salespeople]} onChange={(value) => setFilters({ ...filters, salesperson: value })} />
          <FilterSelect label="Brand" value={filters.brand} options={["All", ...brands]} onChange={(value) => setFilters({ ...filters, brand: value })} />
          <FilterSelect label="Lead source" value={filters.source} options={["All", ...leadSources]} onChange={(value) => setFilters({ ...filters, source: value })} />
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Filtered Leads" value={filtered.length.toString()} />
        <Metric label="Expected Budget" value={formatCurrency(totalBudget)} />
        <Metric label="Hot Overdue" value={hotOverdue.toString()} danger={hotOverdue > 0} />
      </div>

      <SectionTitle title="Lead Overview" />
      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard title="Lead status distribution" option={statusDistribution} />
        <ChartCard title="Leads over time" option={leadsOverTime} />
        <ChartCard title="Conversion funnel" option={funnel} />
      </div>

      <SectionTitle title="Sales Performance" />
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Leads by salesperson" option={barOption(salespersonCounts)} />
        <ChartCard title="Conversion rate by salesperson" option={barOption(conversionRates, "#16a34a")} />
        <ChartCard title="Expected budget by salesperson" option={barOption(salespersonRevenue, "#0f766e")} />
      </div>

      <SectionTitle title="Product Demand" />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Most requested brands" option={barOption(brandCounts)} />
        <ChartCard title="Most requested laptop models" option={barOption(modelCounts, "#7c3aed")} />
        <ChartCard title="Budget distribution" option={barOption(budgetBuckets, "#f97316")} />
        <ChartCard title="Use case distribution" option={barOption(useCaseCounts, "#0891b2")} />
      </div>

      <SectionTitle title="Source Analysis" />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <ChartCard title="Lead source mix" option={barOption(sourceCounts, "#2563eb")} />
        <SectionCard title="Insights Panel">
          <div className="space-y-2 text-[13px] text-gray-700">
            <Insight text={`${topBrand} is currently the strongest demand signal in the filtered view.`} />
            <Insight text={bestSalesperson ? `${bestSalesperson.name} has the highest visible conversion rate at ${bestSalesperson.rate}%.` : "No salesperson data available yet."} />
            <Insight text={`${hotOverdue} hot leads are overdue for follow-up.`} danger={hotOverdue > 0} />
            <Insight text={`${Object.entries(useCaseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Customer"} laptops are trending in customer requirements.`} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function FilterSelect({
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
    <label>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-transparent bg-gray-50 px-3 text-[13px] font-medium text-gray-700 outline-none transition-colors hover:bg-gray-100 focus:border-accent-500 focus:bg-white focus:ring-1 focus:ring-accent-500"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-white p-5 shadow-card transition-colors hover:border-gray-300">
      <div className={`absolute left-0 top-0 h-1 w-full border-t-2 ${danger ? "border-status-red-500" : "border-gray-200"}`} />
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-1.5 text-3xl font-bold tracking-tight ${danger ? "text-status-red-700" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="pt-4 pb-2 text-[15px] font-bold tracking-tight text-ink">{title}</h2>;
}

function Insight({ text, danger }: { text: string; danger?: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2.5 font-medium ${danger ? "bg-status-red-50 text-status-red-700" : "bg-gray-50 text-gray-700"}`}>
      {text}
    </div>
  );
}
