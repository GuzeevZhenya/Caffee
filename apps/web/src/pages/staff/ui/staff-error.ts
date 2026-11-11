export function staffBoardError(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const code = (error as { data?: { error?: string } }).data?.error;
    if (code === "forbidden") return "Этот раздел закрыт для вашей роли.";
    if (code === "email_taken") return "Сотрудник с таким email уже есть.";
    if (code === "shift_already_open") return "Смена уже открыта.";
    if (code === "shift_not_open") return "Сначала откройте смену.";
    if (code === "unauthorized") return "Сессия истекла. Войдите снова.";
    if (code === "invalid_body") return "Проверьте поля формы.";
  }
  return "Не удалось выполнить действие. Проверьте, что API запущен.";
}
