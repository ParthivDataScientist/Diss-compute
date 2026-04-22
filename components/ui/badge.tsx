import type { LeadStatus, Priority } from "@/lib/types";
import { priorityStyles, statusStyles } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide ring-1 ring-inset", statusStyles[status].badge)}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide ring-1 ring-inset", priorityStyles[priority])}>
      {priority}
    </span>
  );
}
