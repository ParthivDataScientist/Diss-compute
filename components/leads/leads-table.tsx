import { useState, useEffect } from "react";
import { Trash2, X } from "lucide-react";
import type { Lead } from "@/lib/types";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils";

type LeadsTableProps = {
  leads: Lead[];
  selectedLeadId?: string;
  onSelectLead: (lead: Lead) => void;
  onDelete: (ids: string[]) => void;
};

export function LeadsTable({ leads, selectedLeadId, onSelectLead, onDelete }: LeadsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);
  const itemsPerPage = 7;

  // Reset page + selection when leads change
  useEffect(() => {
    setCurrentPage(1);
    setCheckedIds(new Set());
  }, [leads]);

  const totalPages = Math.max(1, Math.ceil(leads.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleLeads = leads.slice(startIndex, startIndex + itemsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const visibleIds = visibleLeads.map(l => l.id);
  const allVisibleChecked = visibleIds.length > 0 && visibleIds.every(id => checkedIds.has(id));
  const someChecked = checkedIds.size > 0;

  const toggleAll = () => {
    if (allVisibleChecked) {
      setCheckedIds(prev => {
        const next = new Set(prev);
        visibleIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setCheckedIds(prev => new Set([...prev, ...visibleIds]));
    }
  };

  const toggleOne = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteConfirmed = () => {
    if (!confirmDelete) return;
    onDelete(confirmDelete);
    setCheckedIds(new Set());
    setConfirmDelete(null);
  };

  return (
    <>
      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-[16px] font-bold text-ink">
              Delete {confirmDelete.length} lead{confirmDelete.length > 1 ? "s" : ""}?
            </h3>
            <p className="mt-2 text-[13px] text-gray-500">
              This will permanently remove the selected lead{confirmDelete.length > 1 ? "s" : ""} from your pipeline. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-9 rounded-lg border border-line text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="flex-1 h-9 rounded-lg bg-red-500 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        {/* Bulk Action Bar */}
        {someChecked && (
          <div className="flex items-center justify-between border-b border-red-100 bg-red-50 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold text-red-700">
                {checkedIds.size} lead{checkedIds.size > 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete([...checkedIds])}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-500 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-red-600"
              >
                <Trash2 size={13} />
                Delete Selected
              </button>
              <button
                onClick={() => setCheckedIds(new Set())}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
                title="Clear selection"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        <div className="max-h-[620px] overflow-auto">
          <table className="w-full min-w-[920px] table-fixed text-left text-sm">
            <thead className="sticky top-0 z-[1] bg-white/95 text-[11px] uppercase tracking-wider text-gray-500 backdrop-blur border-b border-line">
              <tr>
                {/* Checkbox column */}
                <th className="w-[4%] px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allVisibleChecked}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500 cursor-pointer"
                    title={allVisibleChecked ? "Deselect all" : "Select all on this page"}
                  />
                </th>
                <th className="w-[17%] px-4 py-2.5 font-semibold">Customer</th>
                <th className="w-[10%] px-4 py-2.5 font-semibold">Status</th>
                <th className="w-[11%] px-4 py-2.5 text-right font-semibold">Budget</th>
                <th className="w-[13%] px-4 py-2.5 font-semibold">Salesperson</th>
                <th className="w-[9%] px-4 py-2.5 font-semibold">Priority</th>
                <th className="w-[14%] px-4 py-2.5 font-semibold">Next Follow-up</th>
                <th className="w-[15%] px-4 py-2.5 font-semibold">Last Note</th>
                <th className="w-[7%] px-4 py-2.5 font-semibold sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {visibleLeads.map((lead) => {
                const isChecked = checkedIds.has(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className={`group transition-colors ${
                      isChecked
                        ? "bg-red-50/60"
                        : selectedLeadId === lead.id
                        ? "bg-accent-50/50"
                        : "bg-white hover:bg-gray-50/80"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(lead.id)}
                        className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500 cursor-pointer"
                      />
                    </td>

                    {/* Customer — click opens drawer */}
                    <td className="px-4 py-2.5 cursor-pointer" onClick={() => onSelectLead(lead)}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 text-[10px] font-bold text-accent-700">
                          {lead.customerName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-ink text-[13px]">{lead.customerName}</div>
                          <div className="mt-0.5 text-[11px] text-muted">{lead.phone}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 cursor-pointer" onClick={() => onSelectLead(lead)}>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[13px] text-gray-700 cursor-pointer" onClick={() => onSelectLead(lead)}>
                      {formatCurrency(lead.budget)}
                    </td>
                    <td className="px-4 py-2.5 cursor-pointer" onClick={() => onSelectLead(lead)}>
                      <div className="flex items-center gap-2">
                        <img src={`https://i.pravatar.cc/150?u=${lead.salesperson}`} alt="" className="h-5 w-5 rounded-full bg-gray-200 object-cover" />
                        <span className="text-[13px] font-medium text-gray-600">{lead.salesperson}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 cursor-pointer" onClick={() => onSelectLead(lead)}>
                      <PriorityBadge priority={lead.priority} />
                    </td>
                    <td className="px-4 py-2.5 cursor-pointer" onClick={() => onSelectLead(lead)}>
                      <span className={
                        isOverdue(lead.nextFollowUpDate) && lead.status !== "Won" && lead.status !== "Lost"
                          ? "text-[13px] font-semibold text-status-red-600"
                          : "text-[13px] font-medium text-gray-600"
                      }>
                        {formatDate(lead.nextFollowUpDate)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[13px] font-medium text-gray-500 cursor-pointer" onClick={() => onSelectLead(lead)}>
                      <span className="line-clamp-1 group-hover:text-ink transition-colors">{lead.lastNotePreview}</span>
                    </td>

                    {/* Row delete button — visible on hover */}
                    <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setConfirmDelete([lead.id])}
                        title="Delete lead"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {leads.length === 0 && (
            <div className="flex min-h-56 items-center justify-center text-sm text-muted">
              No leads match the current filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        {leads.length > 0 && (
          <div className="flex items-center justify-between border-t border-line/60 bg-gray-50/50 px-5 py-3">
            <p className="text-[12px] font-medium text-gray-500">
              Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, leads.length)} of {leads.length} leads
              {someChecked && (
                <span className="ml-2 font-semibold text-red-600">· {checkedIds.size} selected</span>
              )}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-7 w-7 items-center justify-center rounded border border-transparent text-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                &lt;
              </button>
              {pages.map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-7 w-7 items-center justify-center rounded border border-transparent text-[12px] font-medium transition-colors ${
                    currentPage === page ? "bg-accent-50 font-bold text-accent-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded border border-transparent text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
