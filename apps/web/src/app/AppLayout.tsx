import { ScrollToTop } from "@/shared/ui";
import { AppFooter } from "@/widgets/app-footer";
import { AppHeader } from "@/widgets/app-header";
import { Outlet } from "react-router";

/** Общий лейаут приложения: шапка, контент роутера, футер */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
