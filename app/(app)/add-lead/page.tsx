import { AddLeadForm } from "@/components/forms/add-lead-form";
import { getSession } from "@/lib/auth/session";
import { getUsers } from "@/lib/auth/users";

export default async function AddLeadPage() {
  const session = await getSession();
  const ownershipBySalesperson = Object.fromEntries(
    getUsers()
      .filter((user) => user.role === "manager")
      .map((user) => [user.name, user.id])
  );

  return (
    <AddLeadForm
      currentUserId={session?.userId ?? ""}
      ownershipBySalesperson={ownershipBySalesperson}
    />
  );
}
