import { baseApi } from "@/shared/api/baseApi";
import type {
  CreateStaffEmployeeInput,
  PatchStaffMenuInput,
  PatchStaffOrderInput,
  PatchStaffStockInput,
  StaffEmployee,
  StaffEmployeesResponse,
  StaffMenuResponse,
  StaffMenuRow,
  StaffNotificationsResponse,
  StaffOrder,
  StaffOrdersResponse,
  StaffRevenue,
  StaffShift,
  StaffShiftAction,
  StaffShiftsResponse,
  StaffStockItem,
  StaffStockResponse,
} from "@repo/shared";

export const staffBoardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    staffOrders: build.query<StaffOrdersResponse, void>({
      query: () => "staff/orders",
      providesTags: ["Staff"],
    }),
    patchStaffOrder: build.mutation<StaffOrder, { id: string } & PatchStaffOrderInput>({
      query: ({ id, ...body }) => ({ url: `staff/orders/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Staff"],
    }),
    staffMenu: build.query<StaffMenuResponse, void>({
      query: () => "staff/menu",
      providesTags: ["Staff"],
    }),
    patchStaffMenu: build.mutation<StaffMenuRow, { id: string } & PatchStaffMenuInput>({
      query: ({ id, ...body }) => ({ url: `staff/menu/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Staff", "Menu"],
    }),
    staffRevenue: build.query<StaffRevenue, string>({
      query: (date) => `staff/revenue?date=${encodeURIComponent(date)}`,
      providesTags: ["Staff"],
    }),
    staffEmployees: build.query<StaffEmployeesResponse, void>({
      query: () => "staff/employees",
      providesTags: ["Staff"],
    }),
    createStaffEmployee: build.mutation<StaffEmployee, CreateStaffEmployeeInput>({
      query: (body) => ({ url: "staff/employees", method: "POST", body }),
      invalidatesTags: ["Staff"],
    }),
    staffShifts: build.query<StaffShiftsResponse, string>({
      query: (date) => `staff/shifts?date=${encodeURIComponent(date)}`,
      providesTags: ["Staff"],
    }),
    staffShiftAction: build.mutation<StaffShift, StaffShiftAction>({
      query: (body) => ({ url: "staff/shifts", method: "POST", body }),
      invalidatesTags: ["Staff"],
    }),
    staffStock: build.query<StaffStockResponse, void>({
      query: () => "staff/stock",
      providesTags: ["Staff"],
    }),
    patchStaffStock: build.mutation<StaffStockItem, { id: string } & PatchStaffStockInput>({
      query: ({ id, ...body }) => ({ url: `staff/stock/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Staff"],
    }),
    staffNotifications: build.query<StaffNotificationsResponse, void>({
      query: () => "staff/notifications",
      providesTags: ["Staff"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useStaffOrdersQuery,
  usePatchStaffOrderMutation,
  useStaffMenuQuery,
  usePatchStaffMenuMutation,
  useStaffRevenueQuery,
  useStaffEmployeesQuery,
  useCreateStaffEmployeeMutation,
  useStaffShiftsQuery,
  useStaffShiftActionMutation,
  useStaffStockQuery,
  usePatchStaffStockMutation,
  useStaffNotificationsQuery,
} = staffBoardApi;
