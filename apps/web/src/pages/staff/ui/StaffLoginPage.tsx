import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectStaffToken,
  selectStaffUser,
  setSession,
  staffHomePath,
  useLoginMutation,
} from "@/features/staff-auth";
import { safeOrderErrorMessage } from "@/shared/lib";
import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router";

/** `/staff/login` — email + пароль персонала */
export function StaffLoginPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectStaffToken);
  const user = useAppSelector(selectStaffUser);
  const [login, { isLoading, error }] = useLoginMutation();
  const [email, setEmail] = useState("admin@tactile.local");
  const [password, setPassword] = useState("");

  if (token && user) {
    return <Navigate to={staffHomePath(user.role)} replace />;
  }

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      const result = await login({ email: email.trim(), password }).unwrap();
      dispatch(setSession(result));
    } catch {
      // error from mutation
    }
  };

  return (
    <div className="wrap flex max-w-md flex-col gap-6 py-16">
      <div>
        <p className="eyebrow">Персонал</p>
        <h1 className="section-title">Вход</h1>
        <p className="section-sub">Только для сотрудников кофейни.</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4">
        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Пароль</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            required
            minLength={6}
          />
        </label>
        <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
          {isLoading ? "Вхожу…" : "Войти"}
        </button>
        {error ? <p className="text-sm text-rose-warm">{safeOrderErrorMessage(error)}</p> : null}
      </form>

      <Link to="/" className="text-sm text-cream-dim underline-offset-2 hover:text-gold hover:underline">
        ← На сайт
      </Link>
    </div>
  );
}
