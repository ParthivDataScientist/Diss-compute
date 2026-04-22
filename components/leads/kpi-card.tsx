import type { ReactNode } from "react";
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

export function KpiCard({ label, value, active, status, icon, trend, onClick }: KpiCardProps) {
  const accentClass = status ? statusStyles[status].accent : "border-gray-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-white p-5 text-left shadow-card transition-all hover:border-gray-300",
        active && "border-accent-500 ring-1 ring-accent-500 bg-accent-50/10"
      )}
    >
      <div className={cn("absolute left-0 top-0 h-1 w-full border-t-2 opacity-60 group-hover:opacity-100 transition-opacity", accentClass)} />
      
      <div className="flex items-center gap-2">
        {icon && <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", status ? statusStyles[status].badge : "bg-gray-100 text-gray-500")}>{icon}</span>}
        <span className="text-[12px] font-semibold text-gray-500">{label}</span>
      </div>

      <div className="mt-4">
        <span className="text-3xl font-bold tracking-tight text-ink">{value}</span>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1 text-[11px] font-medium">
          {trend.neutral ? null : (
            <span className={trend.positive ? "text-status-green-600" : "text-status-red-600"}>
              {trend.positive ? "↑" : "↓"}
            </span>
          )}
          <span className={trend.neutral ? "text-gray-500" : trend.positive ? "text-status-green-600" : "text-status-red-600"}>
            {trend.text}
          </span>
        </div>
      )}
    </button>
  );
}
