import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-800">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-transparent bg-gray-50 px-3 py-2.5 text-[13px] font-medium text-ink outline-none transition-colors placeholder:text-gray-400 hover:bg-gray-100 focus:border-accent-500 focus:bg-white focus:ring-1 focus:ring-accent-500";
