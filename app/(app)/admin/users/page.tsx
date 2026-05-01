import { UsersWorkspace } from "@/components/admin/users-workspace";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/lib/services/user-service";
import { redirect } from "next/navigation";

export const metadata = { title: "User Management - Circuit CRM" };

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  const users = await userService.getUsers();
  return <UsersWorkspace initialUsers={users} />;
}
