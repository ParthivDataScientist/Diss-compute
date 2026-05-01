import "server-only";

import type { AppUser } from "@/lib/auth/types";
import { userRepository, type UserRepository } from "@/lib/data/user-repository";
import { ValidationError } from "@/lib/server/errors";
import { validateUserWrite } from "@/lib/server/validation";

type UserServiceDeps = {
  repository?: UserRepository;
};

type CreateUserInput = Pick<AppUser, "email" | "name" | "password" | "role">;
type UpdateUserInput = Pick<AppUser, "email" | "name" | "role">;

export function createUserService({ repository = userRepository }: UserServiceDeps = {}) {
  return {
    getUsers(): Promise<AppUser[]> {
      return repository.findMany();
    },

    getUserByEmail(email: string, includePassword = false): Promise<AppUser | undefined> {
      return repository.findByEmail(email, includePassword);
    },

    getUserById(id: string): Promise<AppUser | undefined> {
      return repository.findById(id);
    },

    async createUser(payload: CreateUserInput): Promise<AppUser> {
      const user = validateUserWrite(payload);
      if (!user.password) {
        throw new ValidationError("Initial password is required.");
      }

      return repository.create({
        ...user,
        password: user.password,
        active: true
      });
    },

    updateUser(id: string, payload: UpdateUserInput): Promise<AppUser> {
      const user = validateUserWrite(payload);
      return repository.update(id, {
        name: user.name,
        email: user.email,
        role: user.role
      });
    },

    toggleUserActive(id: string, active: boolean): Promise<AppUser> {
      return repository.update(id, { active });
    },

    resetPassword(id: string): Promise<{ user: AppUser; password: string }> {
      const password = `Reset@${Math.random().toString(36).slice(-6).toUpperCase()}`;
      return repository.update(id, { password }).then((user) => ({ user, password }));
    }
  };
}

export const userService = createUserService();
