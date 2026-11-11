import { AppLayout } from "@/app/AppLayout";
import { RequireStaff, StaffRoleGate } from "@/features/staff-auth";
import { BookingPage } from "@/pages/booking";
import { CheckoutPage } from "@/pages/checkout";
import { HomePage } from "@/pages/home";
import { MenuPage } from "@/pages/menu";
import { MenuItemPage } from "@/pages/menu-item";
import {
  StaffEmployeesPage,
  StaffLoginPage,
  StaffMenuPage,
  StaffNotificationsPage,
  StaffOrdersPage,
  StaffRevenuePage,
  StaffShiftsPage,
  StaffStockPage,
} from "@/pages/staff";
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
              <StaffRoleGate allow={["ADMIN", "BARISTA"]}>
                <StaffOrdersPage />
              </StaffRoleGate>
            ),
          },
          {
            path: "/staff/menu",
            element: (
              <StaffRoleGate allow={["ADMIN"]}>
                <StaffMenuPage />
              </StaffRoleGate>
            ),
          },
          {
            path: "/staff/shifts",
            element: (
              <StaffRoleGate allow={["ADMIN"]}>
                <StaffShiftsPage title="Смены" />
              </StaffRoleGate>
            ),
          },
          {
            path: "/staff/shift",
            element: (
              <StaffRoleGate allow={["BARISTA"]}>
                <StaffShiftsPage title="Моя смена" />
              </StaffRoleGate>
            ),
          },
          {
            path: "/staff/revenue",
            element: (
              <StaffRoleGate allow={["ADMIN"]}>
                <StaffRevenuePage />
              </StaffRoleGate>
            ),
          },
          {
            path: "/staff/notifications",
            element: (
              <StaffRoleGate allow={["ADMIN", "BARISTA"]}>
                <StaffNotificationsPage />
              </StaffRoleGate>
            ),
          },
          {
            path: "/staff/employees",
            element: (
              <StaffRoleGate allow={["ADMIN"]}>
                <StaffEmployeesPage />
              </StaffRoleGate>
            ),
          },
          {
            path: "/staff/stock",
            element: (
              <StaffRoleGate allow={["BARISTA"]}>
                <StaffStockPage />
              </StaffRoleGate>
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
