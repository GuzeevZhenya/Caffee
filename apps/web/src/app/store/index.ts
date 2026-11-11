import { cartReducer } from "@/features/cart";
import { customizerReducer } from "@/features/menu-customizer";
import { staffAuthReducer } from "@/features/staff-auth/model/staffAuthSlice";
import { baseApi } from "@/shared/api/baseApi";
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

// Импорты регистрируют инжектированные эндпоинты RTK Query в baseApi
import "@/entities/menu-item";
import "@/entities/order";
import "@/entities/table";
import "@/features/staff-auth/api/authApi";

/** Фабрика стора (создаётся один раз на клиенте в StoreProvider) */
export function makeStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      customizer: customizerReducer,
      cart: cartReducer,
      staffAuth: staffAuthReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

/** Типизированные хуки (react-redux v9 withTypes) */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
