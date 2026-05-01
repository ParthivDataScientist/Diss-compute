import "server-only";

import type { Session } from "@/lib/auth/types";
import type { Lead, LeadActivity } from "@/lib/types";
import { leadRepository, type LeadRepository } from "@/lib/data/lead-repository";
import { AuthorizationError, ValidationError } from "@/lib/server/errors";
import { validateActivity, validateLeadWrite } from "@/lib/server/validation";

type LeadServiceDeps = {
  repository?: LeadRepository;
};

type LeadCreateInput = Omit<Lead, "id" | "createdAt" | "updatedAt" | "activities">;

export function createLeadService({ repository = leadRepository }: LeadServiceDeps = {}) {
  return {
    getLeadsForSession(session: Session): Promise<Lead[]> {
      return repository.findForSession(session);
    },

    getAllLeads(): Promise<Lead[]> {
      return repository.findAll();
    },

    createLead(session: Session, payload: LeadCreateInput, note?: string): Promise<Lead> {
      const lead = validateLeadWrite(payload);

      if (session.role !== "admin" && lead.ownerId !== session.userId) {
        throw new AuthorizationError("Managers can only create leads assigned to themselves.");
      }

      return repository.create(lead, note?.trim() || undefined);
    },

    updateLead(session: Session, payload: Lead, activity?: LeadActivity): Promise<Lead> {
      const lead = validateLeadWrite(payload);
      if (!payload.id) {
        throw new ValidationError("Lead ID is required.");
      }

      if (session.role !== "admin" && payload.ownerId !== session.userId) {
        throw new AuthorizationError("You can only update your assigned leads.");
      }

      return repository.update({ ...payload, ...lead, id: payload.id, activities: payload.activities }, validateActivity(activity));
    },

    deleteLeads(session: Session, ids: string[]): Promise<void> {
      if (session.role !== "admin") {
        throw new AuthorizationError("Only admins can delete leads.");
      }

      const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
      if (!uniqueIds.length) {
        throw new ValidationError("Select at least one lead to delete.");
      }

      return repository.deleteMany(uniqueIds, session);
    }
  };
}

export const leadService = createLeadService();
