import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, description, action, children, className }: SectionCardProps) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5", className)}>
      {(title || description || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h2> : null}
            {description ? <p className="mt-1 text-[13px] text-muted">{description}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
