import { AppLayout } from "@/app/AppLayout";
import { RequireStaff, StaffRoleGate } from "@/features/staff-auth";
import { AboutPage } from "@/pages/about";
import { BookingPage } from "@/pages/booking";
import { CheckoutPage } from "@/pages/checkout";
import { CookiesPage } from "@/pages/cookies";
import { HomePage } from "@/pages/home";
import { LegalPage } from "@/pages/legal";
import { MenuPage } from "@/pages/menu";
import { MenuItemPage } from "@/pages/menu-item";
import { PrivacyPage } from "@/pages/privacy";
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
import { TmaCartPage, TmaItemPage, TmaLayout, TmaMenuPage } from "@/pages/tma";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";

const router = createBrowserRouter([
  {
    path: "/tma",
    element: <TmaLayout />,
    children: [
      { index: true, element: <TmaMenuPage /> },
      { path: "item/:itemId", element: <TmaItemPage /> },
      { path: "cart", element: <TmaCartPage /> },
      { path: "booking", element: <BookingPage /> },
      { path: "checkout", element: <CheckoutPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/privacy", element: <PrivacyPage /> },
      { path: "/cookies", element: <CookiesPage /> },
      { path: "/legal", element: <LegalPage /> },
      { path: "/menu", element: <MenuPage /> },
      { path: "/menu/:itemId", element: <MenuItemPage /> },
      { path: "/booking", element: <BookingPage /> },
      { path: "/checkout", element: <CheckoutPage /> },

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
