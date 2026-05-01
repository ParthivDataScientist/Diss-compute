import { AddLeadForm } from "@/components/forms/add-lead-form";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/lib/services/user-service";
import { redirect } from "next/navigation";

export default async function AddLeadPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const users = await userService.getUsers();
  const salesUsers =
    session.role === "admin"
      ? users.filter((user) => user.role === "manager" && user.active)
      : [{ id: session.userId, name: session.name }];
  const ownershipBySalesperson = Object.fromEntries(salesUsers.map((user) => [user.name, user.id]));

  return (
    <AddLeadForm
      currentUserId={session?.userId ?? ""}
      currentUserRole={session.role}
      ownershipBySalesperson={ownershipBySalesperson}
      salespersonOptions={salesUsers.map((user) => user.name)}
    />
  );
}
