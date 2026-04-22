"use client";

import { useMemo, useState, useCallback } from "react";
import { Flame, Sun, Snowflake, CheckCircle2, Ban, Clock } from "lucide-react";
import { FilterBar, initialFilters, type LeadFilters } from "@/components/leads/filter-bar";
import { KpiCard } from "@/components/leads/kpi-card";
import { LeadDrawer } from "@/components/leads/lead-drawer";
import { LeadsTable } from "@/components/leads/leads-table";
import { leads as mockLeads } from "@/lib/mock-data";
import type { Lead, LeadStatus } from "@/lib/types";
import type { Session } from "@/lib/auth/types";
import { isOverdue } from "@/lib/utils";

type LeadsWorkspaceProps = {
  session: Session;
};

export function LeadsWorkspace({ session }: LeadsWorkspaceProps) {
  const isAdmin = session.role === "admin";

  // Row-level isolation: managers only see their own leads
  const ownedLeads = useMemo(
    () => (isAdmin ? mockLeads : mockLeads.filter(l => l.ownerId === session.userId)),
    [isAdmin, session.userId]
  );

  const [leads, setLeads] = useState<Lead[]>([...ownedLeads]);
  const [filters, setFilters] = useState<LeadFilters>(initialFilters);
  const [showOverdue, setShowOverdue] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleUpdateLead = useCallback((updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? { ...updatedLead } : l));
    setSelectedLead({ ...updatedLead });
  }, []);

  const handleDelete = useCallback((ids: string[]) => {
    setLeads(prev => prev.filter(l => !ids.includes(l.id)));
    setSelectedLead(prev => prev && ids.includes(prev.id) ? null : prev);
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const query = filters.query.trim().toLowerCase();
      const matchesQuery =
        !query ||
        [lead.customerName, lead.phone, lead.laptopModel, lead.brandInterested, lead.city ?? "", lead.salesperson, lead.lastNotePreview ?? ""]
          .join(" ").toLowerCase().includes(query);

      const matchesDate =
        (!filters.dateFrom || lead.createdAt >= filters.dateFrom) &&
        (!filters.dateTo || lead.createdAt <= filters.dateTo);

      return (
        matchesQuery && matchesDate &&
        (filters.status === "All" || lead.status === filters.status) &&
        (filters.priority === "All" || lead.priority === filters.priority) &&
        (filters.salesperson === "All" || lead.salesperson === filters.salesperson) &&
        (filters.brand === "All" || lead.brandInterested === filters.brand) &&
        (filters.source === "All" || lead.leadSource === filters.source)
      );
    });
  }, [filters, leads]);

  const kpis = useMemo(() => {
    const countStatus = (status: LeadStatus) => leads.filter(l => l.status === status).length;
    return [
      { label: "Hot Leads", value: countStatus("Hot"), status: "Hot" as LeadStatus, icon: <Flame size={14} />, trend: { text: "22% from last week", positive: true } },
      { label: "Warm Leads", value: countStatus("Warm"), status: "Warm" as LeadStatus, icon: <Sun size={14} />, trend: { text: "8% from last week", positive: true } },
      { label: "Cold Leads", value: countStatus("Cold"), status: "Cold" as LeadStatus, icon: <Snowflake size={14} />, trend: { text: "5% from last week", positive: false } },
      { label: "Won", value: countStatus("Won"), status: "Won" as LeadStatus, icon: <CheckCircle2 size={14} />, trend: { text: "19% from last week", positive: true } },
      { label: "Lost", value: countStatus("Lost"), status: "Lost" as LeadStatus, icon: <Ban size={14} />, trend: { text: "12% from last week", positive: false } },
      { label: "Overdue", value: leads.filter(l => isOverdue(l.nextFollowUpDate) && !["Won", "Lost"].includes(l.status)).length, icon: <Clock size={14} />, trend: { text: "Action needed", neutral: true } }
    ];
  }, [leads]);

  const handleKpiClick = (status?: LeadStatus) => {
    if (status) { setShowOverdue(false); setFilters({ ...initialFilters, status }); return; }
    setShowOverdue(true);
    setFilters(initialFilters);
  };

  const tableLeads = showOverdue
    ? filteredLeads.filter(l => isOverdue(l.nextFollowUpDate) && !["Won", "Lost"].includes(l.status))
    : filteredLeads;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-ink">
          {isAdmin ? "All Leads" : "My Leads"}
        </h1>
        <p className="mt-2 text-[13px] font-medium text-gray-500">
          {isAdmin
            ? `Viewing all ${leads.length} leads across the team.`
            : `Showing only your assigned leads - ${leads.length} total.`}
        </p>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
        <div className="flex snap-x snap-mandatory gap-3 lg:grid lg:grid-cols-6 lg:gap-4">
          {kpis.map(kpi => (
            <div key={kpi.label} className="min-w-[232px] snap-start sm:min-w-[248px] lg:min-w-0">
              <KpiCard
                label={kpi.label}
                value={kpi.value}
                status={kpi.status}
                icon={kpi.icon}
                trend={kpi.trend}
                active={kpi.status ? filters.status === kpi.status && !showOverdue : showOverdue}
                onClick={() => handleKpiClick(kpi.status)}
              />
            </div>
          ))}
        </div>
      </div>

      <FilterBar filters={filters} onChange={next => { setShowOverdue(false); setFilters(next); }} />
      <LeadsTable leads={tableLeads} selectedLeadId={selectedLead?.id} onSelectLead={setSelectedLead} onDelete={handleDelete} />
      <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={handleUpdateLead} />
    </div>
  );
}
