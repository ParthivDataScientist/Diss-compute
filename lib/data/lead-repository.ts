import "server-only";

import { ActivityType, LeadStatus as PrismaLeadStatus, Priority as PrismaPriority } from "@prisma/client";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Session } from "@/lib/auth/types";
import type { Lead, LeadActivity, LeadStatus, Priority } from "@/lib/types";
import { ValidationError } from "@/lib/server/errors";

const leadStatusToPrisma: Record<LeadStatus, PrismaLeadStatus> = {
  Hot: PrismaLeadStatus.HOT,
  Warm: PrismaLeadStatus.WARM,
  Cold: PrismaLeadStatus.COLD,
  Won: PrismaLeadStatus.WON,
  Lost: PrismaLeadStatus.LOST
};

const leadStatusFromPrisma: Record<PrismaLeadStatus, LeadStatus> = {
  HOT: "Hot",
  WARM: "Warm",
  COLD: "Cold",
  WON: "Won",
  LOST: "Lost"
};

const priorityToPrisma: Record<Priority, PrismaPriority> = {
  High: PrismaPriority.HIGH,
  Medium: PrismaPriority.MEDIUM,
  Low: PrismaPriority.LOW
};

const priorityFromPrisma: Record<PrismaPriority, Priority> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low"
};

const activityToPrisma: Record<LeadActivity["type"], ActivityType> = {
  Note: ActivityType.NOTE,
  Call: ActivityType.CALL,
  "Follow-up": ActivityType.FOLLOW_UP,
  Status: ActivityType.STATUS_CHANGE
};

const activityFromPrisma: Record<ActivityType, LeadActivity["type"]> = {
  NOTE: "Note",
  CALL: "Call",
  FOLLOW_UP: "Follow-up",
  STATUS_CHANGE: "Status"
};

const leadInclude = {
  salesperson: true,
  leadSource: true,
  activities: {
    include: {
      author: true
    },
    orderBy: {
      createdAt: "desc"
    }
  }
} satisfies Prisma.LeadInclude;

type LeadWithRelations = Prisma.LeadGetPayload<{ include: typeof leadInclude }>;
type LeadWriteInput = Omit<Lead, "id" | "createdAt" | "updatedAt" | "activities">;

function dateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function dateTimeLabel(value: Date) {
  return value.toISOString().slice(0, 16).replace("T", " ");
}

function toNullableText(value: string | undefined) {
  return value?.trim() ? value.trim() : null;
}

function toAppLead(lead: LeadWithRelations): Lead {
  return {
    id: lead.id,
    ownerId: lead.salespersonId,
    customerName: lead.customerName,
    phone: lead.phone,
    email: lead.email ?? undefined,
    city: lead.city ?? undefined,
    brandInterested: lead.brandInterested,
    laptopModel: lead.laptopModel,
    budget: Number(lead.budget),
    useCase: lead.useCase,
    preferredSpecs: lead.preferredSpecs ?? "",
    status: leadStatusFromPrisma[lead.status],
    priority: priorityFromPrisma[lead.priority],
    salesperson: lead.salesperson.name,
    leadSource: lead.leadSource?.name ?? "",
    nextFollowUpDate: dateOnly(lead.nextFollowUpDate),
    lastNotePreview: lead.lastNotePreview ?? "",
    createdAt: dateOnly(lead.createdAt),
    updatedAt: dateOnly(lead.updatedAt),
    activities: lead.activities.map((activity) => ({
      id: activity.id,
      type: activityFromPrisma[activity.type],
      title: activity.title,
      body: activity.body,
      createdAt: dateTimeLabel(activity.createdAt),
      author: activity.author?.name ?? "Sales Team"
    }))
  };
}

export function createLeadRepository(db: PrismaClient = prisma) {
  async function resolveLeadRelations(lead: Pick<LeadWriteInput, "brandInterested" | "laptopModel" | "leadSource" | "salesperson" | "ownerId">) {
    const [salesperson, source, brand] = await Promise.all([
      db.user.findFirst({
        where: {
          OR: [{ id: lead.ownerId }, { name: lead.salesperson }]
        }
      }),
      lead.leadSource
        ? db.leadSource.upsert({
            where: { name: lead.leadSource },
            update: {},
            create: { name: lead.leadSource }
          })
        : null,
      db.brand.upsert({
        where: { name: lead.brandInterested },
        update: {},
        create: { name: lead.brandInterested }
      })
    ]);

    if (!salesperson) {
      throw new ValidationError("Selected salesperson was not found.");
    }

    const productModel = await db.productModel.upsert({
      where: {
        brandId_name: {
          brandId: brand.id,
          name: lead.laptopModel
        }
      },
      update: {},
      create: {
        brandId: brand.id,
        name: lead.laptopModel
      }
    });

    return { salesperson, source, brand, productModel };
  }

  return {
    async findForSession(session: Session): Promise<Lead[]> {
      const leads = await db.lead.findMany({
        where: session.role === "admin" ? undefined : { salespersonId: session.userId },
        include: leadInclude,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
      });

      return leads.map(toAppLead);
    },

    async findAll(): Promise<Lead[]> {
      const leads = await db.lead.findMany({
        include: leadInclude,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
      });

      return leads.map(toAppLead);
    },

    async create(lead: LeadWriteInput, note?: string): Promise<Lead> {
      const relations = await resolveLeadRelations(lead);

      const createdLead = await db.lead.create({
        data: {
          customerName: lead.customerName,
          phone: lead.phone,
          email: toNullableText(lead.email),
          city: toNullableText(lead.city),
          brandId: relations.brand.id,
          productModelId: relations.productModel.id,
          brandInterested: lead.brandInterested,
          laptopModel: lead.laptopModel,
          budget: lead.budget,
          useCase: lead.useCase,
          preferredSpecs: toNullableText(lead.preferredSpecs),
          status: leadStatusToPrisma[lead.status],
          priority: priorityToPrisma[lead.priority],
          salespersonId: relations.salesperson.id,
          leadSourceId: relations.source?.id,
          nextFollowUpDate: lead.nextFollowUpDate ? new Date(`${lead.nextFollowUpDate}T00:00:00.000Z`) : null,
          lastNotePreview: toNullableText(note) ?? toNullableText(lead.lastNotePreview),
          activities: note
            ? {
                create: {
                  authorId: relations.salesperson.id,
                  type: ActivityType.NOTE,
                  title: "Initial Note",
                  body: note
                }
              }
            : undefined
        },
        include: leadInclude
      });

      return toAppLead(createdLead);
    },

    async update(lead: Lead, activity?: LeadActivity): Promise<Lead> {
      const relations = await resolveLeadRelations(lead);

      const updatedLead = await db.lead.update({
        where: { id: lead.id },
        data: {
          customerName: lead.customerName,
          phone: lead.phone,
          email: toNullableText(lead.email),
          city: toNullableText(lead.city),
          brandId: relations.brand.id,
          productModelId: relations.productModel.id,
          brandInterested: lead.brandInterested,
          laptopModel: lead.laptopModel,
          budget: lead.budget,
          useCase: lead.useCase,
          preferredSpecs: toNullableText(lead.preferredSpecs),
          status: leadStatusToPrisma[lead.status],
          priority: priorityToPrisma[lead.priority],
          salespersonId: relations.salesperson.id,
          leadSourceId: relations.source?.id,
          nextFollowUpDate: lead.nextFollowUpDate ? new Date(`${lead.nextFollowUpDate}T00:00:00.000Z`) : null,
          lastNotePreview: toNullableText(lead.lastNotePreview),
          activities: activity
            ? {
                create: {
                  authorId: relations.salesperson.id,
                  type: activityToPrisma[activity.type],
                  title: activity.title,
                  body: activity.body
                }
              }
            : undefined
        },
        include: leadInclude
      });

      return toAppLead(updatedLead);
    },

    async deleteMany(ids: string[], session: Session): Promise<void> {
      await db.lead.deleteMany({
        where: {
          id: { in: ids },
          ...(session.role === "admin" ? {} : { salespersonId: session.userId })
        }
      });
    }
  };
}

export type LeadRepository = ReturnType<typeof createLeadRepository>;
export const leadRepository = createLeadRepository();
