import "server-only";

import type { PrismaClient, User, UserRole as PrismaUserRole } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AppUser, UserRole as AppUserRole } from "@/lib/auth/types";

type UserWithCount = User & {
  _count?: {
    leads: number;
  };
};

function toAppRole(role: PrismaUserRole): AppUserRole {
  return role === UserRole.ADMIN ? "admin" : "manager";
}

function toPrismaRole(role: AppUserRole): PrismaUserRole {
  return role === "admin" ? UserRole.ADMIN : UserRole.MANAGER;
}

function formatDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : undefined;
}

function toAppUser(user: UserWithCount, includePassword = false): AppUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: toAppRole(user.role),
    active: user.active,
    password: includePassword ? user.password : undefined,
    createdAt: user.createdAt.toISOString().slice(0, 10),
    lastLogin: formatDate(user.lastLogin),
    leadCount: user._count?.leads
  };
}

export function createUserRepository(db: PrismaClient = prisma) {
  const includeLeadCount = {
    _count: {
      select: { leads: true }
    }
  };

  return {
    async findMany(): Promise<AppUser[]> {
      const users = await db.user.findMany({
        include: includeLeadCount,
        orderBy: [{ role: "asc" }, { name: "asc" }]
      });

      return users.map((user) => toAppUser(user));
    },

    async findByEmail(email: string, includePassword = false): Promise<AppUser | undefined> {
      const user = await db.user.findUnique({
        where: { email: email.toLowerCase() },
        include: includeLeadCount
      });

      return user ? toAppUser(user, includePassword) : undefined;
    },

    async findById(id: string): Promise<AppUser | undefined> {
      const user = await db.user.findUnique({
        where: { id },
        include: includeLeadCount
      });

      return user ? toAppUser(user) : undefined;
    },

    async create(data: Omit<AppUser, "id" | "createdAt" | "leadCount">): Promise<AppUser> {
      const user = await db.user.create({
        data: {
          email: data.email.toLowerCase(),
          name: data.name,
          password: data.password ?? "Temp@2026",
          active: data.active,
          role: toPrismaRole(data.role),
          lastLogin: data.lastLogin ? new Date(`${data.lastLogin}T00:00:00.000Z`) : undefined
        },
        include: includeLeadCount
      });

      return toAppUser(user);
    },

    async update(id: string, updates: Partial<AppUser>): Promise<AppUser> {
      const user = await db.user.update({
        where: { id },
        data: {
          email: updates.email ? updates.email.toLowerCase() : undefined,
          name: updates.name,
          password: updates.password,
          active: updates.active,
          role: updates.role ? toPrismaRole(updates.role) : undefined,
          lastLogin: updates.lastLogin ? new Date(`${updates.lastLogin}T00:00:00.000Z`) : undefined
        },
        include: includeLeadCount
      });

      return toAppUser(user);
    },

    async delete(id: string): Promise<void> {
      await db.user.delete({ where: { id } });
    }
  };
}

export type UserRepository = ReturnType<typeof createUserRepository>;
export const userRepository = createUserRepository();
