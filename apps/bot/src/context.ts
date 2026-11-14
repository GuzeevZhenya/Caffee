import type { Context, SessionFlavor } from "grammy";

export interface CartLine {
  menuItemId: string;
  name: string;
  quantity: number;
  activeLayerIds: string[];
  unitPrice: number;
}

export interface CafeSession {
  step: "idle" | "await_phone" | "await_phone_code" | "await_location" | "await_order";
  cart: CartLine[];
  pendingPhone?: string;
  phoneCode?: string;
}

export type CafeContext = Context & SessionFlavor<CafeSession>;

export function emptySession(): CafeSession {
  return { step: "idle", cart: [] };
}
