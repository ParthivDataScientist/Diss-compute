import { cn, getInitials } from "@/lib/utils";

type InitialsAvatarProps = {
  name: string;
  className?: string;
  labelClassName?: string;
};

export function InitialsAvatar({ name, className, labelClassName }: InitialsAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200",
        className
      )}
    >
      <span className={cn("text-[11px] font-semibold tracking-tight text-slate-700", labelClassName)}>
        {getInitials(name)}
      </span>
    </div>
  );
}
