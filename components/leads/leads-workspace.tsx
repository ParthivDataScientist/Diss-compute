"use client";

import { useMemo, useState, useCallback } from "react";
import { Flame, Sun, Snowflake, CheckCircle2, Ban, Clock } from "lucide-react";
import { FilterBar, initialFilters, type LeadFilters } from "@/components/leads/filter-bar";
import { KpiCard } from "@/components/leads/kpi-card";
import { LeadDrawer } from "@/components/leads/lead-drawer";
import { LeadsTable } from "@/components/leads/leads-table";
import { deleteLeadsAction, updateLeadAction } from "@/app/actions/leads";
import type { Lead, LeadActivity, LeadStatus } from "@/lib/types";
import type { Session } from "@/lib/auth/types";
import { isOverdue } from "@/lib/utils";

type LeadsWorkspaceProps = {
  session: Session;
  initialLeads: Lead[];
};

export function LeadsWorkspace({ session, initialLeads }: LeadsWorkspaceProps) {
  const isAdmin = session.role === "admin";
  const canDeleteLeads = isAdmin;
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filters, setFilters] = useState<LeadFilters>(initialFilters);
  const [showOverdue, setShowOverdue] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleUpdateLead = useCallback(async (updatedLead: Lead, activity?: LeadActivity) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? { ...updatedLead } : l));
    setSelectedLead({ ...updatedLead });
    const savedLead = await updateLeadAction(updatedLead, activity);
    setLeads(prev => prev.map(l => l.id === savedLead.id ? savedLead : l));
    setSelectedLead(savedLead);
  }, []);

  const handleDelete = useCallback(async (ids: string[]) => {
    const idSet = new Set(ids);
    setLeads(prev => prev.filter(l => !idSet.has(l.id)));
    setSelectedLead(prev => prev && idSet.has(prev.id) ? null : prev);
    await deleteLeadsAction(ids);
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
    const counts = leads.reduce(
      (acc, lead) => {
        acc[lead.status] += 1;
        if (isOverdue(lead.nextFollowUpDate) && !["Won", "Lost"].includes(lead.status)) {
          acc.Overdue += 1;
        }
        return acc;
      },
      { Hot: 0, Warm: 0, Cold: 0, Won: 0, Lost: 0, Overdue: 0 } satisfies Record<LeadStatus | "Overdue", number>
    );

    return [
      { label: "Hot Leads", value: counts.Hot, status: "Hot" as LeadStatus, icon: <Flame size={14} />, trend: { text: "22% from last week", positive: true } },
      { label: "Warm Leads", value: counts.Warm, status: "Warm" as LeadStatus, icon: <Sun size={14} />, trend: { text: "8% from last week", positive: true } },
      { label: "Cold Leads", value: counts.Cold, status: "Cold" as LeadStatus, icon: <Snowflake size={14} />, trend: { text: "5% from last week", positive: false } },
      { label: "Won", value: counts.Won, status: "Won" as LeadStatus, icon: <CheckCircle2 size={14} />, trend: { text: "19% from last week", positive: true } },
      { label: "Lost", value: counts.Lost, status: "Lost" as LeadStatus, icon: <Ban size={14} />, trend: { text: "12% from last week", positive: false } },
      { label: "Overdue", value: counts.Overdue, icon: <Clock size={14} />, trend: { text: "Action needed", neutral: true } }
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
      <LeadsTable
        leads={tableLeads}
        selectedLeadId={selectedLead?.id}
        onSelectLead={setSelectedLead}
        onDelete={handleDelete}
        canDelete={canDeleteLeads}
      />
      <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={handleUpdateLead} />
    </div>
  );
}
