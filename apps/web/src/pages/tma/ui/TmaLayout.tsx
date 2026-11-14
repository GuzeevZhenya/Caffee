import { useAppSelector } from "@/app/store";
import { selectCartCount } from "@/features/cart";
import { bootTelegramWebApp, telegramGuestName, telegramWebApp } from "@/shared/lib";
import { TmaShell } from "@/widgets/tma-shell";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";

/** Layout Mini App: тема Telegram, нижние вкладки, без хедера сайта. */
export function TmaLayout() {
  const cartCount = useAppSelector(selectCartCount);
  const [guestName, setGuestName] = useState("гость");
  const [showHomeBanner, setShowHomeBanner] = useState(false);

  useEffect(() => {
    const app = bootTelegramWebApp();
    setGuestName(telegramGuestName());
    if (!app?.checkHomeScreenStatus) return;
    try {
      app.checkHomeScreenStatus((status) => {
        if (status === "missed" || status === "unknown") {
          setShowHomeBanner(true);
        }
      });
    } catch {
      /* метод есть не во всех клиентах Telegram */
    }
  }, []);

  const onAddHome = (): void => {
    telegramWebApp()?.addToHomeScreen?.();
    setShowHomeBanner(false);
  };

  return (
    <TmaShell
      guestName={guestName}
      cartCount={cartCount}
      showHomeBanner={showHomeBanner}
      onAddHome={onAddHome}
      onDismissHome={() => setShowHomeBanner(false)}
    >
      <Outlet />
    </TmaShell>
  );
}
