import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { LeadsWorkspace } from "@/components/leads/leads-workspace";
import { leadService } from "@/lib/services/lead-service";

export default async function LeadsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const leads = await leadService.getLeadsForSession(session);
  return <LeadsWorkspace session={session} initialLeads={leads} />;
}
