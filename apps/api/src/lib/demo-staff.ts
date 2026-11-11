import type { StaffRole, StaffUser } from "@repo/shared";
import { databaseConfigured } from "./database-configured";
import { readLocalStore, updateLocalStore, type LocalStaffAccount } from "./local-store";

/** Локальный JSON только пока нет настоящей строки Supabase. */
export function demoStaffAllowed(): boolean {
  return process.env.NODE_ENV !== "production" && !databaseConfigured();
}

export function demoStaffByCredentials(email: string, password: string): StaffUser | null {
  const account = readLocalStore().staff.find((item) => item.email === email.toLowerCase());
  if (!account || account.password !== password) return null;
  return toStaffUser(account);
}

export function demoStaffByEmail(email: string): StaffUser | null {
  const account = readLocalStore().staff.find((item) => item.email === email.toLowerCase());
  return account ? toStaffUser(account) : null;
}

export function listDemoStaff(): StaffUser[] {
  return readLocalStore().staff.map(toStaffUser);
}

export function addDemoStaff(input: {
  email: string;
  password: string;
  role: StaffRole;
  firstName: string;
}): StaffUser | null {
  const email = input.email.toLowerCase();
  let created: StaffUser | null = null;
  updateLocalStore((data) => {
    if (data.staff.some((item) => item.email === email)) return;
    const account: LocalStaffAccount = {
      id: `demo-${crypto.randomUUID()}`,
      email,
      password: input.password,
      role: input.role,
      firstName: input.firstName,
    };
    data.staff.push(account);
    created = toStaffUser(account);
  });
  return created;
}

function toStaffUser(account: LocalStaffAccount): StaffUser {
  return {
    id: account.id,
    email: account.email,
    role: account.role,
    firstName: account.firstName,
  };
}
