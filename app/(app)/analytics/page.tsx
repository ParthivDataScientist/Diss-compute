import { AnalyticsWorkspace } from "@/components/analytics/analytics-workspace";
import { getSession } from "@/lib/auth/session";
import { leadService } from "@/lib/services/lead-service";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  const leads = await leadService.getAllLeads();
  return <AnalyticsWorkspace initialLeads={leads} />;
}
