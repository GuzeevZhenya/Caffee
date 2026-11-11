import { AppLayout } from "@/app/AppLayout";
import { RequireStaff } from "@/features/staff-auth";
import { BookingPage } from "@/pages/booking";
import { CheckoutPage } from "@/pages/checkout";
import { HomePage } from "@/pages/home";
import { MenuPage } from "@/pages/menu";
import { MenuItemPage } from "@/pages/menu-item";
import { StaffLoginPage, StaffStubPage } from "@/pages/staff";
import { TmaPage } from "@/pages/tma";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/menu", element: <MenuPage /> },
      { path: "/menu/:itemId", element: <MenuItemPage /> },
      { path: "/booking", element: <BookingPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/tma", element: <TmaPage /> },

      { path: "/staff/login", element: <StaffLoginPage /> },
      {
        element: <RequireStaff />,
        children: [
          { path: "/staff", element: <Navigate to="/staff/orders" replace /> },
          {
            path: "/staff/orders",
            element: (
              <StaffStubPage
                title="Заказы"
                description="Список заказов смены — в следующем срезе."
              />
            ),
          },
          {
            path: "/staff/menu",
            element: (
              <StaffStubPage
                title="Меню"
                description="Редактирование и архивация позиций — в следующем срезе."
              />
            ),
          },
          {
            path: "/staff/shifts",
            element: (
              <StaffStubPage
                title="Смены"
                description="Календарь смен 10:00–23:00 — в следующем срезе."
              />
            ),
          },
          {
            path: "/staff/shift",
            element: (
              <StaffStubPage
                title="Моя смена"
                description="Принятие смены и продажи — в следующем срезе."
              />
            ),
          },
          {
            path: "/staff/revenue",
            element: (
              <StaffStubPage
                title="Выручка"
                description="Дневная выручка и метрики — в следующем срезе."
              />
            ),
          },
          {
            path: "/staff/notifications",
            element: (
              <StaffStubPage
                title="Уведомления"
                description="Алерты для персонала — в следующем срезе."
              />
            ),
          },
          {
            path: "/staff/employees",
            element: (
              <StaffStubPage
                title="Сотрудники"
                description="Аккаунты и роли — в следующем срезе."
              />
            ),
          },
          {
            path: "/staff/stock",
            element: (
              <StaffStubPage
                title="Склад"
                description="Остатки выпечки и дозаказ — в следующем срезе."
              />
            ),
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
