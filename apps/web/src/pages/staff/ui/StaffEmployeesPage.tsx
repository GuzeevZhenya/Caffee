import { useCreateStaffEmployeeMutation, useStaffEmployeesQuery } from "@/features/staff-board";
import { STAFF_ROLES, type StaffRole } from "@repo/shared";
import { useState, type FormEvent } from "react";
import { staffBoardError } from "./staff-error";
import { StaffSection } from "./StaffSection";

function isStaffRole(value: string): value is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(value);
}

/** `/staff/employees` — список персонала и новая учётка */
export function StaffEmployeesPage() {
  const { data, isLoading, isError, error } = useStaffEmployeesQuery();
  const [createEmployee, state] = useCreateStaffEmployeeMutation();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("BARISTA");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      await createEmployee({ firstName: firstName.trim(), email: email.trim(), role, password }).unwrap();
      setFirstName("");
      setEmail("");
      setPassword("");
    } catch {
      // текст ошибки берётся из mutation state
    }
  };

  return (
    <StaffSection eyebrow="Кабинет · админ" title="Сотрудники">
      {isLoading ? <p className="text-cream-dim">Загружаю сотрудников…</p> : null}
      {isError ? <p className="text-sm text-rose-warm">{staffBoardError(error)}</p> : null}
      {data ? (
        <ul className="grid gap-2">
          {data.employees.map((employee) => (
            <li key={employee.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink-500 py-3 text-sm">
              <span className="text-cream">{employee.firstName ?? employee.email}</span>
              <span className="text-cream-dim">
                {employee.email} · {employee.role === "ADMIN" ? "Админ" : "Бариста"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <form onSubmit={(event) => void handleSubmit(event)} className="grid max-w-md gap-4">
        <h2 className="font-display text-2xl text-cream">Новый сотрудник</h2>
        <label className="field">
          <span className="field-label">Имя</span>
          <input className="field-input" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" className="field-input" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="field">
          <span className="field-label">Роль</span>
          <select
            className="field-input"
            value={role}
            onChange={(event) => {
              if (isStaffRole(event.target.value)) setRole(event.target.value);
            }}
          >
            <option value="BARISTA">Бариста</option>
            <option value="ADMIN">Админ</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">Пароль</span>
          <input
            type="password"
            minLength={6}
            className="field-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={state.isLoading}>
          {state.isLoading ? "Сохраняю…" : "Добавить"}
        </button>
        {state.isError ? <p className="text-sm text-rose-warm">{staffBoardError(state.error)}</p> : null}
      </form>
    </StaffSection>
  );
}
