import type { RootState } from "@/app/store";
import type { StaffUser } from "@repo/shared";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const TOKEN_KEY = "tactile.staff.token";

export interface StaffAuthState {
  token: string | null;
  user: StaffUser | null;
}

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

const initialState: StaffAuthState = {
  token: readStoredToken(),
  user: null,
};

const staffAuthSlice = createSlice({
  name: "staffAuth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ token: string; user: StaffUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      try {
        localStorage.setItem(TOKEN_KEY, action.payload.token);
      } catch {
        // private mode — сессия только в памяти
      }
    },
    setUser(state, action: PayloadAction<StaffUser>) {
      state.user = action.payload;
    },
    clearSession(state) {
      state.token = null;
      state.user = null;
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        // ignore
      }
    },
  },
});

export const { setSession, setUser, clearSession } = staffAuthSlice.actions;
export const staffAuthReducer = staffAuthSlice.reducer;

export const selectStaffToken = (state: RootState): string | null => state.staffAuth.token;
export const selectStaffUser = (state: RootState): StaffUser | null => state.staffAuth.user;
export const selectIsStaffLoggedIn = (state: RootState): boolean =>
  Boolean(state.staffAuth.token && state.staffAuth.user);
