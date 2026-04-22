export type LeadStatus = "Hot" | "Warm" | "Cold" | "Won" | "Lost";
export type Priority = "High" | "Medium" | "Low";

export type ActivityType = "Note" | "Call" | "Follow-up" | "Status";

export type LeadActivity = {
  id: string;
  type: ActivityType;
  title: string;
  body: string;
  createdAt: string;
  author: string;
};

export type Lead = {
  id: string;
  ownerId: string; // Links to AppUser.id for row-level isolation
  customerName: string;
  phone: string;
  email?: string;
  city?: string;
  brandInterested: string;
  laptopModel: string;
  budget: number;
  useCase: string;
  preferredSpecs: string;
  status: LeadStatus;
  priority: Priority;
  salesperson: string;
  leadSource: string;
  nextFollowUpDate: string;
  lastNotePreview: string;
  createdAt: string;
  updatedAt: string;
  activities: LeadActivity[];
};
