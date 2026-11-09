import { makeStore, type AppStore } from "@/app/store";
import { useRef, type ReactNode } from "react";
import { Provider } from "react-redux";

/** Провайдер Redux-стора: стор создаётся один раз на клиенте */
export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
