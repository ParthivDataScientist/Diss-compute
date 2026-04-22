import type { LeadStatus, Priority } from "@/lib/types";

export const statuses: LeadStatus[] = ["Hot", "Warm", "Cold", "Won", "Lost"];
export const priorities: Priority[] = ["High", "Medium", "Low"];
export const salespeople = ["Asha Nair", "Rohan Mehta", "Imran Khan", "Neha Kapoor"];
export const leadSources = ["Walk-in", "WhatsApp", "Instagram", "Referral", "Website"];
export const brands = ["Dell", "HP", "Lenovo", "Asus", "Acer", "Apple"];
export const useCases = ["Office", "Student", "Gaming", "Design", "Programming", "Business"];

export const statusStyles: Record<LeadStatus, { badge: string; soft: string; accent: string; chart: string }> = {
  Hot: {
    badge: "bg-status-red-50 text-status-red-700 ring-status-red-200",
    soft: "bg-status-red-50 text-status-red-700 border-status-red-200",
    accent: "border-status-red-600",
    chart: "#dc2626"
  },
  Warm: {
    badge: "bg-status-orange-50 text-status-orange-700 ring-status-orange-200",
    soft: "bg-status-orange-50 text-status-orange-700 border-status-orange-200",
    accent: "border-status-orange-600",
    chart: "#ea580c"
  },
  Cold: {
    badge: "bg-status-blue-50 text-status-blue-700 ring-status-blue-200",
    soft: "bg-status-blue-50 text-status-blue-700 border-status-blue-200",
    accent: "border-status-blue-600",
    chart: "#2563eb"
  },
  Won: {
    badge: "bg-status-green-50 text-status-green-700 ring-status-green-200",
    soft: "bg-status-green-50 text-status-green-700 border-status-green-200",
    accent: "border-status-green-600",
    chart: "#16a34a"
  },
  Lost: {
    badge: "bg-status-gray-50 text-status-gray-700 ring-status-gray-200",
    soft: "bg-status-gray-50 text-status-gray-700 border-status-gray-200",
    accent: "border-status-gray-600",
    chart: "#4b5563"
  }
};

export const priorityStyles: Record<Priority, string> = {
  High: "bg-status-red-50 text-status-red-700 ring-status-red-200",
  Medium: "bg-status-orange-50 text-status-orange-700 ring-status-orange-200",
  Low: "bg-status-gray-50 text-status-gray-700 ring-status-gray-200"
};
