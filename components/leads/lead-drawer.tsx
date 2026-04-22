import { useState, useEffect } from "react";
import { CalendarClock, CheckCircle2, FileText, MapPin, Phone, X, XCircle, Save } from "lucide-react";
import type { Lead } from "@/lib/types";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { brands, leadSources, priorities, salespeople, statuses, useCases } from "@/lib/constants";

type LeadDrawerProps = {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
};

export function LeadDrawer({ lead, onClose, onUpdate }: LeadDrawerProps) {
  const isOpen = Boolean(lead);
  const [activeTab, setActiveTab] = useState<"details" | "notes" | "activity">("details");
  
  const [editingSection, setEditingSection] = useState<"Requirement" | "Lead Info" | "Note" | "Follow-up" | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [noteText, setNoteText] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  useEffect(() => {
    if (lead) {
      setEditForm({ ...lead });
      setEditingSection(null);
      setActiveTab("details");
      setNoteText("");
      setFollowUpDate(lead.nextFollowUpDate || "");
    }
  }, [lead?.id]);

  const handleSave = () => {
    if (lead) {
      onUpdate({ ...lead, ...editForm } as Lead);
    }
    setEditingSection(null);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-gray-950/20 transition-opacity ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-full max-w-[720px] transform flex-col border-l border-line bg-white shadow-panel transition duration-300 ease-out md:w-[40vw] md:minw-[460px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        {lead ? (
          <>
            <header className="shrink-0 border-b border-line px-6 pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-100 text-[16px] font-bold text-accent-700">
                    {lead.customerName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold tracking-tight text-ink">{lead.customerName}</h2>
                      <StatusBadge status={lead.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-gray-400" /> {lead.phone}
                      </div>
                      {lead.city && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" /> {lead.city}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 flex gap-6">
                <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")}>Details</TabButton>
                <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")}>Notes ({lead.activities.filter(a => a.type === "Note").length || 4})</TabButton>
                <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>Activity</TabButton>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {activeTab === "details" && (
                <div className="space-y-6">
                  <DrawerSection 
                    title="Requirement" 
                    hasEdit 
                    isEditing={editingSection === "Requirement"}
                    onEdit={() => setEditingSection("Requirement")}
                    onSave={handleSave}
                    onCancel={() => { setEditingSection(null); setEditForm(lead); }}
                  >
                    <DetailGrid
                      isEditing={editingSection === "Requirement"}
                      editForm={editForm}
                      onChange={(k, v) => setEditForm(prev => ({ ...prev, [k]: v }))}
                      items={[
                        { label: "Brand", key: "brandInterested", value: lead.brandInterested, type: "select", options: brands },
                        { label: "Model", key: "laptopModel", value: lead.laptopModel },
                        { label: "Use Case", key: "useCase", value: lead.useCase, type: "select", options: useCases },
                        { label: "Budget", key: "budget", value: formatCurrency(lead.budget), rawValue: lead.budget, type: "number" },
                        { label: "Preferred Specs", key: "preferredSpecs", value: lead.preferredSpecs }
                      ]}
                    />
                  </DrawerSection>

                  <DrawerSection 
                    title="Lead Info" 
                    hasEdit 
                    isEditing={editingSection === "Lead Info"}
                    onEdit={() => setEditingSection("Lead Info")}
                    onSave={handleSave}
                    onCancel={() => { setEditingSection(null); setEditForm(lead); }}
                  >
                    <DetailGrid
                      isEditing={editingSection === "Lead Info"}
                      editForm={editForm}
                      onChange={(k, v) => setEditForm(prev => ({ ...prev, [k]: v }))}
                      items={[
                        { label: "Salesperson", key: "salesperson", value: lead.salesperson, type: "select", options: salespeople },
                        { label: "Status", key: "status", value: lead.status, type: "select", options: statuses },
                        { label: "Priority", key: "priority", value: lead.priority, type: "select", options: priorities },
                        { label: "Source", key: "leadSource", value: lead.leadSource, type: "select", options: leadSources },
                        { label: "Next Follow-up", key: "nextFollowUpDate", value: formatDate(lead.nextFollowUpDate), rawValue: lead.nextFollowUpDate, type: "date" }
                      ]}
                    />
                  </DrawerSection>

                  <DrawerSection title="Quick Actions">
                    <div className="grid grid-cols-2 gap-3">
                      <ActionButton onClick={() => setEditingSection("Note")} label="Add Note" icon={<FileText size={14} />} />
                      <ActionButton onClick={() => { setFollowUpDate(lead.nextFollowUpDate || ""); setEditingSection("Follow-up"); }} label="Schedule Follow-up" icon={<CalendarClock size={14} />} />
                      <ActionButton onClick={() => onUpdate({ ...lead, status: "Won" } as Lead)} label="Mark Won" icon={<CheckCircle2 size={14} />} intent="success" />
                      <ActionButton onClick={() => onUpdate({ ...lead, status: "Lost" } as Lead)} label="Mark Lost" icon={<XCircle size={14} />} intent="danger" />
                    </div>
                    
                    {editingSection === "Note" && (
                      <div className="mt-4 rounded-lg border border-line bg-gray-50 p-3">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="w-full min-h-[80px] rounded border border-line bg-white p-2 text-[13px] outline-none focus:border-accent-500"
                          placeholder="Type your note here..."
                        />
                        <div className="mt-3 flex justify-end gap-2">
                          <button onClick={() => { setEditingSection(null); setNoteText(""); }} className="text-[11px] font-semibold text-gray-500 hover:text-ink px-3 py-1.5 transition-colors">Cancel</button>
                          <button onClick={() => {
                            if (noteText.trim()) {
                              const newActivity = {
                                id: `act-${Date.now()}`,
                                type: "Note" as const,
                                title: "Quick Note",
                                body: noteText.trim(),
                                createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
                                author: "Sales Team"
                              };
                              onUpdate({ ...lead, activities: [newActivity, ...lead.activities] } as Lead);
                            }
                            setEditingSection(null);
                            setNoteText("");
                            setActiveTab("notes");
                          }} className="rounded bg-accent-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-accent-700">Save Note</button>
                        </div>
                      </div>
                    )}

                    {editingSection === "Follow-up" && (
                      <div className="mt-4 rounded-lg border border-line bg-gray-50 p-3">
                        <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Select Follow-up Date</label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="w-full h-9 rounded border border-line bg-white px-3 text-[13px] outline-none focus:border-accent-500"
                        />
                        <div className="mt-3 flex justify-end gap-2">
                          <button onClick={() => setEditingSection(null)} className="text-[11px] font-semibold text-gray-500 hover:text-ink px-3 py-1.5 transition-colors">Cancel</button>
                          <button onClick={() => {
                            if (followUpDate) {
                              const newActivity = {
                                id: `act-${Date.now()}`,
                                type: "Follow-up" as const,
                                title: "Follow-up Scheduled",
                                body: `Scheduled next follow-up for ${formatDate(followUpDate)}`,
                                createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
                                author: "Sales Team"
                              };
                              onUpdate({ ...lead, nextFollowUpDate: followUpDate, activities: [newActivity, ...lead.activities] } as Lead);
                            }
                            setEditingSection(null);
                            setActiveTab("activity");
                          }} className="rounded bg-accent-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-accent-700">Schedule</button>
                        </div>
                      </div>
                    )}
                  </DrawerSection>
                </div>
              )}

              {activeTab !== "details" && (
                <div className="space-y-4">
                  {lead.activities.map((activity) => (
                    <div key={activity.id} className="relative border-l border-line pl-4 py-1">
                      <span className="absolute -left-[5px] top-2.5 h-2.5 w-2.5 rounded-full bg-accent-600 ring-4 ring-white" />
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-semibold text-ink">{activity.title}</p>
                        <span className="shrink-0 text-[11px] text-gray-500 font-medium">{activity.createdAt}</span>
                      </div>
                      <p className="mt-1 text-[13px] text-gray-600 leading-relaxed">{activity.body}</p>
                      <p className="mt-1.5 text-[11px] font-medium text-gray-400">{activity.type} by {activity.author}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative pb-3 text-[13px] font-bold transition-colors ${active ? "text-accent-600" : "text-gray-500 hover:text-ink"}`}
    >
      {children}
      {active && <div className="absolute bottom-0 left-0 h-0.5 w-full bg-accent-600 rounded-t-full" />}
    </button>
  );
}

function DrawerSection({ 
  title, 
  hasEdit, 
  isEditing,
  onEdit,
  onSave,
  onCancel,
  children 
}: { 
  title: string; 
  hasEdit?: boolean; 
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  children: React.ReactNode 
}) {
  return (
    <section className="py-2 border-b border-line/60 last:border-0 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-ink">{title}</h3>
        {hasEdit && !isEditing && (
          <button onClick={onEdit} className="text-[11px] font-semibold text-gray-500 hover:text-ink rounded border border-line px-2 py-1 transition-colors">Edit</button>
        )}
        {isEditing && (
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="text-[11px] font-semibold text-gray-500 hover:text-ink rounded border border-line px-2 py-1 transition-colors">Cancel</button>
            <button onClick={onSave} className="flex items-center gap-1 bg-accent-600 text-white text-[11px] font-semibold rounded px-2 py-1 transition-colors hover:bg-accent-700">
              <Save size={12} /> Save
            </button>
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

type DetailItem = {
  label: string;
  key: keyof Lead;
  value: string;
  rawValue?: any;
  type?: "text" | "number" | "select" | "date";
  options?: readonly string[];
};

function DetailGrid({ 
  items, 
  isEditing, 
  editForm, 
  onChange 
}: { 
  items: DetailItem[], 
  isEditing?: boolean,
  editForm?: Partial<Lead>,
  onChange?: (key: keyof Lead, value: any) => void
}) {
  return (
    <dl className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
      {items.map((item) => {
        const isFullWidth = item.label === "Preferred Specs";
        const currentValue = editForm ? editForm[item.key] : item.rawValue || item.value;

        return (
          <div key={item.label} className={isFullWidth ? "sm:col-span-2" : "flex items-center gap-2"}>
            <dt className="text-[12px] font-medium text-gray-500 w-24 shrink-0">{item.label}</dt>
            <dd className="text-[13px] font-semibold text-ink flex-1">
              {isEditing ? (
                item.type === "select" ? (
                  <select 
                    value={currentValue as string}
                    onChange={(e) => onChange?.(item.key, e.target.value)}
                    className="w-full h-7 text-[12px] rounded border border-line bg-gray-50 px-2 outline-none focus:border-accent-500"
                  >
                    {item.options?.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={item.type || "text"}
                    value={currentValue as string}
                    onChange={(e) => onChange?.(item.key, item.type === "number" ? Number(e.target.value) : e.target.value)}
                    className="w-full h-7 text-[12px] rounded border border-line bg-gray-50 px-2 outline-none focus:border-accent-500"
                  />
                )
              ) : (
                item.value
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function ActionButton({
  label,
  icon,
  intent = "default",
  onClick
}: {
  label: string;
  icon?: React.ReactNode;
  intent?: "default" | "success" | "danger";
  onClick?: () => void;
}) {
  const styles = {
    default: "border-line text-gray-700 hover:bg-gray-50 active:bg-gray-100",
    success: "border-status-green-200 text-status-green-700 hover:bg-status-green-50",
    danger: "border-status-red-200 text-status-red-700 hover:bg-status-red-50"
  };

  return (
    <button type="button" onClick={onClick} className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-bold transition-colors ${styles[intent]}`}>
      {icon}
      {label}
    </button>
  );
}
