import { Navigate } from "react-router";

/**
 * Вход для Telegram Mini App. Пока отдельного облегчённого UI нет —
 * отправляем на витрину меню; deep-linking и initData-авторизация — в Фазе 5.
 */
export function TmaPage() {
  return <Navigate to="/" replace />;
}
