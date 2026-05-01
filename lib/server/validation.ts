import "server-only";

import { brands, leadSources, priorities, statuses, useCases } from "@/lib/constants";
import type { AppUser, UserRole } from "@/lib/auth/types";
import type { Lead, LeadActivity, LeadStatus, Priority } from "@/lib/types";
import { ValidationError } from "@/lib/server/errors";

const validStatuses = new Set<string>(statuses);
const validPriorities = new Set<string>(priorities);
const validBrands = new Set<string>(brands);
const validLeadSources = new Set<string>(leadSources);
const validUseCases = new Set<string>(useCases);
const validRoles = new Set<string>(["admin", "manager"]);
const validActivityTypes = new Set<string>(["Note", "Call", "Follow-up", "Status"]);

type LeadWritePayload = Omit<Lead, "id" | "createdAt" | "updatedAt" | "activities"> & Partial<Pick<Lead, "id">>;
type UserWritePayload = Pick<AppUser, "email" | "name" | "password" | "role">;

function cleanText(value: unknown, field: string, maxLength = 255) {
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be text.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError(`${field} is required.`);
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(`${field} is too long.`);
  }

  return trimmed;
}

function optionalText(value: unknown, field: string, maxLength = 255) {
  if (value === undefined || value === null || value === "") return undefined;
  return cleanText(value, field, maxLength);
}

function assertChoice<T extends string>(value: unknown, field: string, choices: Set<string>): T {
  const text = cleanText(value, field);
  if (!choices.has(text)) {
    throw new ValidationError(`${field} is invalid.`);
  }

  return text as T;
}

function assertIsoDate(value: unknown, field: string) {
  const text = cleanText(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(new Date(`${text}T00:00:00.000Z`).getTime())) {
    throw new ValidationError(`${field} must be a valid date.`);
  }

  return text;
}

export function validateLeadWrite(payload: LeadWritePayload): LeadWritePayload {
  const budget = Number(payload.budget);
  if (!Number.isFinite(budget) || budget <= 0) {
    throw new ValidationError("Budget must be a positive number.");
  }

  return {
    ...payload,
    id: payload.id ? cleanText(payload.id, "Lead ID") : undefined,
    ownerId: cleanText(payload.ownerId, "Owner"),
    customerName: cleanText(payload.customerName, "Customer name"),
    phone: cleanText(payload.phone, "Phone number", 40),
    email: optionalText(payload.email, "Email", 255),
    city: optionalText(payload.city, "City", 120),
    brandInterested: assertChoice(payload.brandInterested, "Brand", validBrands),
    laptopModel: cleanText(payload.laptopModel, "Laptop model", 120),
    budget,
    useCase: assertChoice(payload.useCase, "Use case", validUseCases),
    preferredSpecs: optionalText(payload.preferredSpecs, "Preferred specs", 500) ?? "",
    status: assertChoice<LeadStatus>(payload.status, "Status", validStatuses),
    priority: assertChoice<Priority>(payload.priority, "Priority", validPriorities),
    salesperson: cleanText(payload.salesperson, "Salesperson"),
    leadSource: assertChoice(payload.leadSource, "Lead source", validLeadSources),
    nextFollowUpDate: assertIsoDate(payload.nextFollowUpDate, "Next follow-up date"),
    lastNotePreview: optionalText(payload.lastNotePreview, "Last note", 500) ?? ""
  };
}

export function validateActivity(activity: LeadActivity | undefined): LeadActivity | undefined {
  if (!activity) return undefined;

  return {
    ...activity,
    id: cleanText(activity.id, "Activity ID"),
    type: assertChoice(activity.type, "Activity type", validActivityTypes),
    title: cleanText(activity.title, "Activity title", 160),
    body: cleanText(activity.body, "Activity body", 1000),
    createdAt: cleanText(activity.createdAt, "Activity date", 40),
    author: cleanText(activity.author, "Activity author", 160)
  };
}

export function validateUserWrite(payload: UserWritePayload): UserWritePayload {
  const email = cleanText(payload.email, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("Email is invalid.");
  }

  return {
    name: cleanText(payload.name, "Name", 120),
    email,
    role: assertChoice<UserRole>(payload.role, "Role", validRoles),
    password: payload.password ? cleanText(payload.password, "Password", 128) : undefined
  };
}
