import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import type { Lead } from "@/lib/types";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
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

  useEffect(() => {
    setCurrentPage(1);
    setCheckedIds(new Set());
  }, [leads]);

  const totalPages = Math.max(1, Math.ceil(leads.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleLeads = leads.slice(startIndex, startIndex + itemsPerPage);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const visibleIds = visibleLeads.map((lead) => lead.id);
  const allVisibleChecked = visibleIds.length > 0 && visibleIds.every((id) => checkedIds.has(id));
  const someChecked = checkedIds.size > 0;

  const toggleAll = () => {
    if (allVisibleChecked) {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setCheckedIds((prev) => new Set([...prev, ...visibleIds]));
    }
  };

  const toggleOne = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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
                className="h-11 flex-1 rounded-xl border border-line text-[13px] font-medium text-gray-600 transition-colors active:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="h-11 flex-1 rounded-xl bg-red-500 text-[13px] font-semibold text-white transition-colors active:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        {someChecked && (
          <div className="flex flex-col gap-3 border-b border-red-100 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[13px] font-semibold text-red-700">
              {checkedIds.size} lead{checkedIds.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete([...checkedIds])}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-500 px-3 text-[12px] font-semibold text-white transition-colors active:bg-red-600"
              >
                <Trash2 size={13} />
                Delete Selected
              </button>
              <button
                onClick={() => setCheckedIds(new Set())}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-red-400 transition-colors active:bg-red-100 active:text-red-600"
                title="Clear selection"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        <div className="lg:hidden">
          {leads.length === 0 ? (
            <div className="flex min-h-56 items-center justify-center px-4 text-center text-sm text-muted">
              No leads match the current filters.
            </div>
          ) : (
            <div className="space-y-3 p-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={allVisibleChecked}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                  />
                  Select page
                </label>
                <span className="text-[12px] text-slate-500">{visibleLeads.length} visible</span>
              </div>

              {visibleLeads.map((lead) => {
                const isChecked = checkedIds.has(lead.id);
                const isSelected = selectedLeadId === lead.id;
                const isLeadOverdue = isOverdue(lead.nextFollowUpDate) && !["Won", "Lost"].includes(lead.status);

                return (
                  <article
                    key={lead.id}
                    className={`rounded-2xl border p-4 transition-colors ${
                      isChecked
                        ? "border-red-200 bg-red-50/60"
                        : isSelected
                          ? "border-accent-200 bg-accent-50/40"
                          : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-1" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(lead.id)}
                          className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectLead(lead)}
                        className="flex min-w-0 flex-1 items-start gap-3 text-left"
                      >
                        <InitialsAvatar name={lead.customerName} className="h-10 w-10" labelClassName="text-[12px]" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[15px] font-semibold text-ink">{lead.customerName}</p>
                              <p className="mt-1 text-[12px] text-slate-500">{lead.salesperson}</p>
                            </div>
                            <p className="shrink-0 text-[15px] font-semibold text-ink">{formatCurrency(lead.budget)}</p>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <StatusBadge status={lead.status} />
                            <PriorityBadge priority={lead.priority} />
                          </div>

                          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-[12px]">
                            <div>
                              <dt className="text-slate-500">Next follow-up</dt>
                              <dd className={isLeadOverdue ? "mt-1 font-semibold text-status-red-600" : "mt-1 font-medium text-slate-700"}>
                                {formatDate(lead.nextFollowUpDate)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-slate-500">Salesperson</dt>
                              <dd className="mt-1 font-medium text-slate-700">{lead.salesperson}</dd>
                            </div>
                          </dl>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDelete([lead.id])}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors active:bg-red-50 active:text-red-500"
                        title="Delete lead"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <div className="max-h-[620px] overflow-auto">
            <table className="w-full min-w-[920px] table-fixed text-left text-sm">
              <thead className="sticky top-0 z-[1] border-b border-line bg-white/95 text-[11px] uppercase tracking-wider text-gray-500 backdrop-blur">
                <tr>
                  <th className="w-[4%] px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={allVisibleChecked}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
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
                      <td className="px-4 py-2.5" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(lead.id)}
                          className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                        />
                      </td>
                      <td className="cursor-pointer px-4 py-2.5" onClick={() => onSelectLead(lead)}>
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={lead.customerName} className="h-7 w-7" labelClassName="text-[10px]" />
                          <div>
                            <div className="text-[13px] font-semibold text-ink">{lead.customerName}</div>
                            <div className="mt-0.5 text-[11px] text-muted">{lead.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="cursor-pointer px-4 py-2.5" onClick={() => onSelectLead(lead)}>
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="cursor-pointer px-4 py-2.5 text-right text-[13px] font-semibold tabular-nums text-gray-700" onClick={() => onSelectLead(lead)}>
                        {formatCurrency(lead.budget)}
                      </td>
                      <td className="cursor-pointer px-4 py-2.5" onClick={() => onSelectLead(lead)}>
                        <div className="flex items-center gap-2">
                          <InitialsAvatar name={lead.salesperson} className="h-5 w-5" labelClassName="text-[9px]" />
                          <span className="text-[13px] font-medium text-gray-600">{lead.salesperson}</span>
                        </div>
                      </td>
                      <td className="cursor-pointer px-4 py-2.5" onClick={() => onSelectLead(lead)}>
                        <PriorityBadge priority={lead.priority} />
                      </td>
                      <td className="cursor-pointer px-4 py-2.5" onClick={() => onSelectLead(lead)}>
                        <span
                          className={
                            isOverdue(lead.nextFollowUpDate) && lead.status !== "Won" && lead.status !== "Lost"
                              ? "text-[13px] font-semibold text-status-red-600"
                              : "text-[13px] font-medium text-gray-600"
                          }
                        >
                          {formatDate(lead.nextFollowUpDate)}
                        </span>
                      </td>
                      <td className="cursor-pointer px-4 py-2.5 text-[13px] font-medium text-gray-500" onClick={() => onSelectLead(lead)}>
                        <span className="line-clamp-1 transition-colors group-hover:text-ink">{lead.lastNotePreview}</span>
                      </td>
                      <td className="px-2 py-2.5" onClick={(event) => event.stopPropagation()}>
                        <button
                          onClick={() => setConfirmDelete([lead.id])}
                          title="Delete lead"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-all hover:bg-red-50 hover:text-red-500"
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
        </div>

        {leads.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line/60 bg-gray-50/50 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5">
            <p className="text-[12px] font-medium text-gray-500">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, leads.length)} of {leads.length} leads
              {someChecked ? <span className="ml-2 font-semibold text-red-600">- {checkedIds.size} selected</span> : null}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="flex h-10 min-w-[40px] items-center justify-center rounded-xl border border-transparent text-gray-400 transition-colors active:bg-gray-100 disabled:opacity-50 disabled:active:bg-transparent"
              >
                &lt;
              </button>
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-10 min-w-[40px] items-center justify-center rounded-xl border border-transparent text-[12px] font-medium transition-colors ${
                    currentPage === page ? "bg-accent-50 font-bold text-accent-700" : "text-gray-600 active:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="flex h-10 min-w-[40px] items-center justify-center rounded-xl border border-transparent text-gray-600 transition-colors active:bg-gray-100 disabled:opacity-50 disabled:active:bg-transparent"
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
