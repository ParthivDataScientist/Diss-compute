"use client";

import { useState } from "react";
import { Plus, Shield, UserCheck, UserX, Edit2, RotateCcw, Search } from "lucide-react";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { getUsers, createUser, updateUser } from "@/lib/auth/users";
import type { AppUser, UserRole } from "@/lib/auth/types";
import { leads } from "@/lib/mock-data";

function getLeadCount(userId: string) {
  return leads.filter(l => l.ownerId === userId).length;
}

type FormState = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const emptyForm: FormState = { name: "", email: "", password: "", role: "manager" };

export function UsersWorkspace() {
  const [users, setUsers] = useState<AppUser[]>(getUsers());
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [resetInfo, setResetInfo] = useState<{ name: string; password: string } | null>(null);

  const refresh = () => setUsers([...getUsers()]);

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setFormError("");
    if (!form.name || !form.email || !form.password) {
      setFormError("All fields are required.");
      return;
    }
    if (getUsers().find(u => u.email === form.email)) {
      setFormError("A user with this email already exists.");
      return;
    }
    createUser({ ...form, active: true });
    refresh();
    setShowForm(false);
    setForm(emptyForm);
  };

  const handleEdit = () => {
    if (!editUser) return;
    updateUser(editUser.id, { name: form.name, role: form.role, email: form.email });
    refresh();
    setEditUser(null);
    setForm(emptyForm);
  };

  const handleToggleActive = (user: AppUser) => {
    updateUser(user.id, { active: !user.active });
    refresh();
  };

  const handleResetPassword = (user: AppUser) => {
    const newPass = `Reset@${Math.random().toString(36).slice(-6).toUpperCase()}`;
    updateUser(user.id, { password: newPass });
    setResetInfo({ name: user.name, password: newPass });
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-accent-600" />
            <h1 className="text-[24px] font-bold tracking-tight text-ink">User Management</h1>
          </div>
          <p className="mt-1 text-[13px] text-gray-500 font-medium">
            Manage who can access Circuit CRM. Only admins can create or modify users.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditUser(null); setForm(emptyForm); setFormError(""); }}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent-600 px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-accent-700 transition-colors"
        >
          <Plus size={15} />
          Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Users", value: users.length },
          { label: "Active", value: users.filter(u => u.active).length },
          { label: "Inactive", value: users.filter(u => !u.active).length },
          { label: "Managers", value: users.filter(u => u.role === "manager").length }
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-line bg-white p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Create/Edit modal */}
      {(showForm || editUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl">
            <h3 className="mb-5 text-[16px] font-bold text-ink">
              {editUser ? "Edit User" : "Create New User"}
            </h3>
            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{formError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-gray-700">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-line bg-gray-50 px-3 text-[13px] outline-none focus:border-accent-500"
                  placeholder="e.g. Priya Singh"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-line bg-gray-50 px-3 text-[13px] outline-none focus:border-accent-500"
                  placeholder="user@circuit.com"
                />
              </div>
              {!editUser && (
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-gray-700">Initial Password</label>
                  <input
                    type="text"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-line bg-gray-50 px-3 text-[13px] outline-none focus:border-accent-500"
                    placeholder="Temp@2026"
                  />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-gray-700">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
                  className="h-9 w-full rounded-lg border border-line bg-gray-50 px-3 text-[13px] outline-none focus:border-accent-500"
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => { setShowForm(false); setEditUser(null); setForm(emptyForm); }}
                className="h-9 rounded-lg border border-line px-4 text-[13px] font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editUser ? handleEdit : handleCreate}
                className="h-9 rounded-lg bg-accent-600 px-4 text-[13px] font-semibold text-white hover:bg-accent-700"
              >
                {editUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password confirmation */}
      {resetInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              <RotateCcw size={22} />
            </div>
            <h3 className="text-[16px] font-bold text-ink">Password Reset</h3>
            <p className="mt-2 text-[13px] text-gray-500">
              Share this temporary password with <strong>{resetInfo.name}</strong>:
            </p>
            <div className="mt-4 rounded-lg border border-dashed border-accent-300 bg-accent-50 py-3 px-4">
              <code className="text-[16px] font-bold tracking-wide text-accent-700">{resetInfo.password}</code>
            </div>
            <button
              onClick={() => setResetInfo(null)}
              className="mt-5 h-9 w-full rounded-lg bg-accent-600 text-[13px] font-semibold text-white hover:bg-accent-700"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Search + Table */}
      <div className="rounded-xl border border-line bg-white shadow-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={15} className="text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-gray-400"
            placeholder="Search users..."
          />
          <span className="text-[12px] font-medium text-gray-400">{filtered.length} users</span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-gray-50/80 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Leads</th>
              <th className="px-5 py-3">Last Login</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={user.name} />
                    <div>
                      <p className="text-[13px] font-semibold text-ink">{user.name}</p>
                      <p className="text-[11px] text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    user.role === "admin" ? "bg-accent-100 text-accent-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    <Shield size={11} />
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    user.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                  }`}>
                    {user.active ? <UserCheck size={12} /> : <UserX size={12} />}
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3 text-[13px] font-semibold text-gray-700">
                  {getLeadCount(user.id)}
                </td>
                <td className="px-5 py-3 text-[13px] text-gray-500">{user.lastLogin ?? "—"}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditUser(user); setForm({ name: user.name, email: user.email, password: "", role: user.role }); }}
                      title="Edit user"
                      className="h-7 w-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-ink transition-colors flex items-center justify-center"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleResetPassword(user)}
                      title="Reset password"
                      className="h-7 w-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-amber-600 transition-colors flex items-center justify-center"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      title={user.active ? "Deactivate" : "Activate"}
                      className={`h-7 w-7 rounded-lg transition-colors flex items-center justify-center ${
                        user.active
                          ? "text-gray-400 hover:bg-red-50 hover:text-red-500"
                          : "text-gray-400 hover:bg-green-50 hover:text-green-600"
                      }`}
                    >
                      {user.active ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
