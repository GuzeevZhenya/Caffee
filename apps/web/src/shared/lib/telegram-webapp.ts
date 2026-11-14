export interface TelegramWebAppUser {
  first_name?: string;
  last_name?: string;
  username?: string;
  id?: number;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  initData?: string;
  platform?: string;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  initDataUnsafe?: { user?: TelegramWebAppUser };
  checkHomeScreenStatus?: (callback: (status: string) => void) => void;
  addToHomeScreen?: () => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function telegramWebApp(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp;
}

export function isTelegramMiniApp(): boolean {
  const app = telegramWebApp();
  return Boolean(app?.initData);
}

export function bootTelegramWebApp(): TelegramWebApp | undefined {
  const app = telegramWebApp();
  if (!app || !app.initData) return undefined;
  try {
    app.ready();
    app.expand();
    app.setHeaderColor?.("#16110e");
    app.setBackgroundColor?.("#16110e");
  } catch {
    return undefined;
  }
  return app;
}

export function telegramGuestName(): string {
  const name = telegramWebApp()?.initDataUnsafe?.user?.first_name?.trim();
  return name && name.length > 0 ? name : "гость";
}
