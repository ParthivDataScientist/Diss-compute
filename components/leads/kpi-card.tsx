import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { LeadStatus } from "@/lib/types";
import { statusStyles } from "@/lib/constants";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: number;
  active?: boolean;
  status?: LeadStatus;
  icon?: ReactNode;
  trend?: { text: string; positive?: boolean; neutral?: boolean };
  onClick: () => void;
};

const statusIconTone: Record<LeadStatus, string> = {
  Hot: "text-status-red-600",
  Warm: "text-status-orange-600",
  Cold: "text-status-blue-600",
  Won: "text-status-green-600",
  Lost: "text-status-gray-600"
};

const statusAccentTone: Record<LeadStatus, string> = {
  Hot: "bg-status-red-600",
  Warm: "bg-status-orange-600",
  Cold: "bg-status-blue-600",
  Won: "bg-status-green-600",
  Lost: "bg-status-gray-600"
};

export function KpiCard({ label, value, active, status, icon, trend, onClick }: KpiCardProps) {
  const trendTone = trend?.neutral
    ? "text-gray-500"
    : trend?.positive
      ? "text-status-green-700"
      : "text-status-red-700";
  const accentTone = status ? statusAccentTone[status] : "bg-slate-400";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative flex h-full flex-col rounded-xl bg-white p-4 text-left ring-1 ring-slate-200/90 transition-all duration-200",
        "shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]",
        active && "ring-accent-500/45 shadow-[0_8px_20px_rgba(37,99,235,0.12)]"
      )}
    >
      <span className={cn("absolute inset-x-4 top-0 h-1 rounded-b-full opacity-90", accentTone)} />

      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-medium text-gray-500">{label}</span>
        {icon && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg ring-1",
              status ? statusStyles[status].badge : "bg-slate-100 text-slate-600 ring-slate-200"
            )}
          >
            <span className={status ? statusIconTone[status] : "text-gray-500"}>{icon}</span>
          </span>
        )}
      </div>

      <div className="mt-3">
        <span className="text-[34px] font-bold leading-none tracking-tight text-ink">{value}</span>
      </div>

      {trend && (
        <div className={cn("mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium", trendTone)}>
          {trend.neutral ? (
            <Minus size={14} />
          ) : trend.positive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          <span className="truncate">{trend.text}</span>
        </div>
      )}
    </button>
  );
}
