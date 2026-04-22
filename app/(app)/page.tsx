import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { LeadsWorkspace } from "@/components/leads/leads-workspace";

export default async function LeadsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <LeadsWorkspace session={session} />;
}
