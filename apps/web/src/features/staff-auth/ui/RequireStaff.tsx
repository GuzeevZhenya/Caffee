import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  clearSession,
  selectStaffToken,
  selectStaffUser,
  setUser,
  useMeQuery,
} from "@/features/staff-auth";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

/** Guard для /staff/*: нужен валидный JWT + роль ADMIN|BARISTA */
export function RequireStaff() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectStaffToken);
  const user = useAppSelector(selectStaffUser);
  const location = useLocation();

  const { data, isError, isFetching, isSuccess } = useMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  useEffect(() => {
    if (isError) dispatch(clearSession());
  }, [isError, dispatch]);

  if (!token || isError) {
    return <Navigate to="/staff/login" replace state={{ from: location.pathname }} />;
  }

  if (!user && (isFetching || !isSuccess)) {
    return (
      <div className="wrap py-16">
        <p className="text-cream-dim">Проверяю сессию…</p>
      </div>
    );
  }

  return <Outlet />;
}
