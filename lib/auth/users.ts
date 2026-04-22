import type { AppUser } from "./types";

// In production: replace with Supabase DB query
let USERS: AppUser[] = [
  {
    id: "admin-001",
    email: "admin@circuit.com",
    name: "Circuit Admin",
    role: "admin",
    active: true,
    password: "Admin@2026",
    createdAt: "2026-01-01",
    lastLogin: "2026-04-22"
  },
  {
    id: "mgr-asha",
    email: "asha@circuit.com",
    name: "Asha Nair",
    role: "manager",
    active: true,
    password: "Manager@2026",
    createdAt: "2026-01-15",
    lastLogin: "2026-04-20"
  },
  {
    id: "mgr-rohan",
    email: "rohan@circuit.com",
    name: "Rohan Mehta",
    role: "manager",
    active: true,
    password: "Manager@2026",
    createdAt: "2026-01-15",
    lastLogin: "2026-04-21"
  },
  {
    id: "mgr-imran",
    email: "imran@circuit.com",
    name: "Imran Khan",
    role: "manager",
    active: true,
    password: "Manager@2026",
    createdAt: "2026-01-15",
    lastLogin: "2026-04-22"
  },
  {
    id: "mgr-neha",
    email: "neha@circuit.com",
    name: "Neha Kapoor",
    role: "manager",
    active: true,
    password: "Manager@2026",
    createdAt: "2026-01-15",
    lastLogin: "2026-04-19"
  },
  {
    id: "mgr-priya",
    email: "priya@circuit.com",
    name: "Priya Singh",
    role: "manager",
    active: true,
    password: "Manager@2026",
    createdAt: "2026-02-01",
    lastLogin: "2026-04-18"
  }
];

export function getUsers(): AppUser[] {
  return USERS;
}

export function getUserByEmail(email: string): AppUser | undefined {
  return USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): AppUser | undefined {
  return USERS.find(u => u.id === id);
}

export function createUser(data: Omit<AppUser, "id" | "createdAt">): AppUser {
  const newUser: AppUser = {
    ...data,
    id: `usr-${Date.now()}`,
    createdAt: new Date().toISOString().split("T")[0]
  };
  USERS.push(newUser);
  return newUser;
}

export function updateUser(id: string, updates: Partial<AppUser>): void {
  USERS = USERS.map(u => (u.id === id ? { ...u, ...updates } : u));
}

export function deleteUser(id: string): void {
  USERS = USERS.filter(u => u.id !== id);
}
