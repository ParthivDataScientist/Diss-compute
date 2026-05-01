import { AddLeadForm } from "@/components/forms/add-lead-form";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/lib/services/user-service";
import { redirect } from "next/navigation";

export default async function AddLeadPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  const users = await userService.getUsers();
  const salesUsers = users.filter((user) => user.role === "manager" && user.active);
  const ownershipBySalesperson = Object.fromEntries(salesUsers.map((user) => [user.name, user.id]));

  return (
    <AddLeadForm
      currentUserId={session?.userId ?? ""}
      ownershipBySalesperson={ownershipBySalesperson}
      salespersonOptions={salesUsers.map((user) => user.name)}
    />
  );
}
