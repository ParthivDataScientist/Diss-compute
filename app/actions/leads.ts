"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { guardedAction } from "@/lib/server/action-guard";
import { AuthenticationError } from "@/lib/server/errors";
import { leadService } from "@/lib/services/lead-service";
import type { Lead, LeadActivity } from "@/lib/types";

export async function createLeadAction(
  lead: Omit<Lead, "id" | "createdAt" | "updatedAt" | "activities">,
  note?: string
) {
  const session = await getSession();
  if (!session) {
    throw new AuthenticationError("You must be signed in to create leads.");
  }

  return guardedAction({ action: "lead.create", session }, async () => {
    const createdLead = await leadService.createLead(session, lead, note);
    revalidatePath("/");
    revalidatePath("/analytics");
    return createdLead;
  });
}

export async function updateLeadAction(lead: Lead, activity?: LeadActivity) {
  const session = await getSession();
  if (!session) {
    throw new AuthenticationError("You must be signed in to update leads.");
  }

  return guardedAction({ action: "lead.update", session }, async () => {
    const updatedLead = await leadService.updateLead(session, lead, activity);
    revalidatePath("/");
    revalidatePath("/analytics");
    return updatedLead;
  });
}

export async function deleteLeadsAction(ids: string[]) {
  const session = await getSession();
  if (!session) {
    throw new AuthenticationError("You must be signed in to delete leads.");
  }

  return guardedAction({ action: "lead.delete", session }, async () => {
    await leadService.deleteLeads(session, ids);
    revalidatePath("/");
    revalidatePath("/analytics");
  });
}
