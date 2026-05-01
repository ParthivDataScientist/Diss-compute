"use server";

import { redirect } from "next/navigation";
import { setSession, clearSession } from "@/lib/auth/session";
import { authenticateWithPassword } from "@/lib/services/auth-service";
import { logger } from "@/lib/server/logger";
import { AppError } from "@/lib/server/errors";

export async function loginAction(_: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  try {
    const session = await authenticateWithPassword(email, password);
    await setSession(session);
  } catch (error) {
    logger.warn("login_failed", { email: email?.toLowerCase() });

    if (error instanceof AppError) {
      return { error: error.message };
    }

    return { error: "Unable to sign in right now." };
  }

  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
