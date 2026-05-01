"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { guardedAction } from "@/lib/server/action-guard";
import { AuthorizationError } from "@/lib/server/errors";
import { userService } from "@/lib/services/user-service";
import type { AppUser } from "@/lib/auth/types";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new AuthorizationError("Admin access is required.");
  }

  return session;
}

export async function createUserAction(data: Pick<AppUser, "name" | "email" | "role" | "password">) {
  const session = await requireAdmin();

  return guardedAction({ action: "user.create", session }, async () => {
    const user = await userService.createUser(data);
    revalidatePath("/admin/users");
    revalidatePath("/add-lead");
    return user;
  });
}

export async function updateUserAction(id: string, updates: Pick<AppUser, "name" | "email" | "role">) {
  const session = await requireAdmin();

  return guardedAction({ action: "user.update", session }, async () => {
    const user = await userService.updateUser(id, updates);
    revalidatePath("/admin/users");
    revalidatePath("/add-lead");
    return user;
  });
}

export async function toggleUserActiveAction(id: string, active: boolean) {
  const session = await requireAdmin();

  return guardedAction({ action: "user.toggle_active", session }, async () => {
    const user = await userService.toggleUserActive(id, active);
    revalidatePath("/admin/users");
    return user;
  });
}

export async function resetUserPasswordAction(id: string) {
  const session = await requireAdmin();

  return guardedAction({ action: "user.reset_password", session }, async () => {
    const result = await userService.resetPassword(id);
    revalidatePath("/admin/users");
    return result;
  });
}
