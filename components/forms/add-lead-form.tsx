"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Save } from "lucide-react";
import { brands, leadSources, priorities, salespeople, statuses, useCases } from "@/lib/constants";
import { FormField, inputClass } from "@/components/ui/form-field";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";
import { leads as mockLeads } from "@/lib/mock-data";

type FormState = {
  customerName: string;
  phone: string;
  email: string;
  city: string;
  brandInterested: string;
  laptopModel: string;
  budget: string;
  useCase: string;
  preferredSpecs: string;
  status: string;
  priority: string;
  salesperson: string;
  leadSource: string;
  nextFollowUpDate: string;
  notes: string;
};

const emptyForm: FormState = {
  customerName: "",
  phone: "",
  email: "",
  city: "",
  brandInterested: brands[0],
  laptopModel: "",
  budget: "",
  useCase: useCases[0],
  preferredSpecs: "",
  status: "Warm",
  priority: "Medium",
  salesperson: salespeople[0],
  leadSource: "Walk-in",
  nextFollowUpDate: "",
  notes: ""
};

type Errors = Partial<Record<keyof FormState, string>>;

export function AddLeadForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [savedMessage, setSavedMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(() => Object.entries(form).some(([key, value]) => value !== emptyForm[key as keyof FormState]), [form]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: Errors = {};
    if (!form.customerName.trim()) nextErrors.customerName = "Customer name is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required.";
    if (!form.laptopModel.trim()) nextErrors.laptopModel = "Laptop model is required.";
    if (!form.budget.trim()) nextErrors.budget = "Budget is required.";
    if (Number(form.budget) <= 0 || Number.isNaN(Number(form.budget))) nextErrors.budget = "Enter a valid numeric budget.";
    if (!form.nextFollowUpDate) nextErrors.nextFollowUpDate = "Select the next follow-up date.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>, addAnother = false) => {
    event.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);

    // Add to mock data
    mockLeads.unshift({
      id: `lead-${Date.now()}`,
      customerName: form.customerName,
      phone: form.phone,
      email: form.email,
      city: form.city,
      brandInterested: form.brandInterested,
      laptopModel: form.laptopModel,
      budget: Number(form.budget),
      useCase: form.useCase,
      preferredSpecs: form.preferredSpecs,
      status: form.status as any,
      priority: form.priority as any,
      salesperson: form.salesperson,
      leadSource: form.leadSource,
      nextFollowUpDate: form.nextFollowUpDate,
      lastNotePreview: form.notes,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      activities: form.notes ? [
        {
          id: `act-${Date.now()}`,
          type: "Note",
          title: "Initial Note",
          body: form.notes,
          createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          author: form.salesperson
        }
      ] : []
    });

    if (addAnother) {
      setSavedMessage("Lead saved. Ready for the next entry.");
      setForm(emptyForm);
      setIsSubmitting(false);
    } else {
      router.push("/");
    }
  };

  return (
    <form className="space-y-6" onSubmit={(event) => handleSubmit(event)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-ink">
            <ArrowLeft size={14} />
            Back to leads
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Add Lead</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">A compact entry flow for salespeople. Structured fields keep analytics useful later.</p>
        </div>
        {savedMessage ? (
          <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-status-green-200 bg-status-green-50 px-3 text-[13px] font-medium text-status-green-700">
            <Check size={14} />
            {savedMessage}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <SectionCard title="Customer Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Customer Name" required error={errors.customerName}>
                <input className={inputClass} value={form.customerName} onChange={(event) => update("customerName", event.target.value)} placeholder="e.g. Priya S" />
              </FormField>
              <FormField label="Phone Number" required error={errors.phone}>
                <input className={inputClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+91 98765 43210" />
              </FormField>
              <FormField label="Email">
                <input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="optional" />
              </FormField>
              <FormField label="City / Area">
                <input className={inputClass} value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="optional" />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Requirement Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Brand Interested" value={form.brandInterested} onChange={(value) => update("brandInterested", value)} options={brands} />
              <FormField label="Laptop Model" required error={errors.laptopModel}>
                <input className={inputClass} value={form.laptopModel} onChange={(event) => update("laptopModel", event.target.value)} placeholder="e.g. ThinkPad E14" />
              </FormField>
              <FormField label="Budget" required error={errors.budget}>
                <input className={inputClass} type="number" min="0" value={form.budget} onChange={(event) => update("budget", event.target.value)} placeholder="75000" />
              </FormField>
              <SelectField label="Use Case" value={form.useCase} onChange={(value) => update("useCase", value)} options={useCases} />
              <div className="sm:col-span-2">
                <FormField label="Preferred Specs">
                  <input className={inputClass} value={form.preferredSpecs} onChange={(event) => update("preferredSpecs", event.target.value)} placeholder="i5, 16 GB RAM, 512 GB SSD" />
                </FormField>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Lead Details">
            <div className="grid gap-4">
              <SelectField label="Status" value={form.status} onChange={(value) => update("status", value)} options={statuses} />
              <SelectField label="Priority" value={form.priority} onChange={(value) => update("priority", value)} options={priorities} />
              <SelectField label="Salesperson" value={form.salesperson} onChange={(value) => update("salesperson", value)} options={salespeople} />
              <SelectField label="Lead Source" value={form.leadSource} onChange={(value) => update("leadSource", value)} options={leadSources} />
              <FormField label="Next Follow-up Date" required error={errors.nextFollowUpDate}>
                <input className={inputClass} type="date" value={form.nextFollowUpDate} onChange={(event) => update("nextFollowUpDate", event.target.value)} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Notes">
            <FormField label="Free Notes">
              <textarea
                className={cn(inputClass, "min-h-40 resize-y")}
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                placeholder="Wants Dell only. Needs delivery before Friday. Call after 6 PM."
              />
            </FormField>
          </SectionCard>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 border-t border-line/60 bg-surface/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-transparent px-4 text-[13px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-ink"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(event) => handleSubmit(event as unknown as FormEvent<HTMLFormElement>, true)}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-line bg-white px-4 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
          >
            Save & Add Another
          </button>
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-accent-600 px-4 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 active:bg-accent-800"
          >
            {isSubmitting ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save size={14} />
            )}
            Save Lead
          </button>
        </div>
      </div>
    </form>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <FormField label={label}>
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </FormField>
  );
}