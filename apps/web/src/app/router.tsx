import { AppLayout } from "@/app/AppLayout";
import { BookingPage } from "@/pages/booking";
import { CheckoutPage } from "@/pages/checkout";
import { HomePage } from "@/pages/home";
import { MenuPage } from "@/pages/menu";
import { MenuItemPage } from "@/pages/menu-item";
import { TmaPage } from "@/pages/tma";
import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/menu", element: <MenuPage /> },
      { path: "/menu/:itemId", element: <MenuItemPage /> },
      { path: "/booking", element: <BookingPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      // Облегчённый вход для Telegram Mini App
      { path: "/tma", element: <TmaPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
