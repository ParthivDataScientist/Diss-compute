import "server-only";

import { userService } from "@/lib/services/user-service";
import type { Session } from "@/lib/auth/types";
import { AuthenticationError, AuthorizationError } from "@/lib/server/errors";

export async function authenticateWithPassword(email: string, password: string): Promise<Session> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw new AuthenticationError("Email and password are required.");
  }

  const user = await userService.getUserByEmail(normalizedEmail, true);
  if (!user || user.password !== password) {
    throw new AuthenticationError("Invalid email or password.");
  }

  if (!user.active) {
    throw new AuthorizationError("Your account has been deactivated. Contact the admin.");
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}
