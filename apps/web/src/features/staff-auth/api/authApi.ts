import { baseApi } from "@/shared/api/baseApi";
import type { LoginInput, LoginResponse, StaffUser } from "@repo/shared";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginInput>({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
    }),
    me: build.query<StaffUser, void>({
      query: () => ({ url: "auth/me" }),
    }),
  }),
  overrideExisting: true,
});

export const { useLoginMutation, useMeQuery, useLazyMeQuery } = authApi;
