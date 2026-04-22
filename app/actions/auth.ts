"use server";

import { redirect } from "next/navigation";
import { getUserByEmail } from "@/lib/auth/users";
import { setSession, clearSession } from "@/lib/auth/session";
import type { Session } from "@/lib/auth/types";

export async function loginAction(_: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = getUserByEmail(email);

  if (!user) {
    return { error: "Invalid email or password." };
  }

  if (!user.active) {
    return { error: "Your account has been deactivated. Contact the admin." };
  }

  if (user.password !== password) {
    return { error: "Invalid email or password." };
  }

  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  await setSession(session);
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
