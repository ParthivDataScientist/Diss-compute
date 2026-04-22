export type UserRole = "admin" | "manager";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  password: string;
  createdAt: string;
  lastLogin?: string;
};

export type Session = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
};
