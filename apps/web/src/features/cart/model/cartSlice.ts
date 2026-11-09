import type { RootState } from "@/app/store";
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  roundMoney,
  type CustomConfiguration,
  type MenuItem3DConfig,
  type OrderType,
} from "@repo/shared";

/** Одна позиция корзины — блюдо со слепком кастомизации */
export interface CartItem {
  lineId: string;
  menuItemId: string;
  slug: string;
  name: string;
  quantity: number;
  configuration: CustomConfiguration;
  /** Цена за шт с учётом кастомизации (из selectCustomizerTotals) */
  unitPrice: number;
}

/** Привязанная к корзине бронь столика (сценарий «к приходу в кафе») */
export interface CartBooking {
  tableId: string;
  tableTitle: string;
  slotStart: string;
  slotEnd: string;
  /** Дедлайн холда из Redis — для таймера TableHoldTimer */
  heldUntil: string | null;
}

export interface CartState {
  items: CartItem[];
  orderType: OrderType;
  booking: CartBooking | null;
}

const initialState: CartState = {
  items: [],
  orderType: "DINE_IN",
  booking: null,
};

export interface AddToCartInput {
  item: MenuItem3DConfig;
  configuration: CustomConfiguration;
  unitPrice: number;
  quantity?: number;
}

/** Одинаковые кастомизации одного блюда сливаются в одну строку корзины */
function isSameConfiguration(a: CustomConfiguration, b: CustomConfiguration): boolean {
  return [...a.activeLayerIds].sort().join("|") === [...b.activeLayerIds].sort().join("|");
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: {
      reducer(state, action: PayloadAction<CartItem>) {
        const existing = state.items.find(
          (line) =>
            line.menuItemId === action.payload.menuItemId &&
            isSameConfiguration(line.configuration, action.payload.configuration),
        );
        if (existing) {
          existing.quantity += action.payload.quantity;
        } else {
          state.items.push(action.payload);
        }
      },
      prepare(input: AddToCartInput) {
        return {
          payload: {
            lineId: crypto.randomUUID(),
            menuItemId: input.item.id,
            slug: input.item.slug,
            name: input.item.name,
            quantity: input.quantity ?? 1,
            configuration: input.configuration,
            unitPrice: input.unitPrice,
          } satisfies CartItem,
        };
      },
    },
    setQuantity(state, action: PayloadAction<{ lineId: string; quantity: number }>) {
      const line = state.items.find((l) => l.lineId === action.payload.lineId);
      if (!line) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((l) => l.lineId !== action.payload.lineId);
      } else {
        line.quantity = Math.min(action.payload.quantity, 20);
      }
    },
    attachBooking(state, action: PayloadAction<CartBooking>) {
      state.booking = action.payload;
      state.orderType = "DINE_IN";
    },
    detachBooking(state) {
      state.booking = null;
    },
    setOrderType(state, action: PayloadAction<OrderType>) {
      state.orderType = action.payload;
      if (action.payload !== "DINE_IN") state.booking = null;
    },
    clearCart(state) {
      state.items = [];
      state.booking = null;
    },
  },
});

export const { addItem, setQuantity, attachBooking, detachBooking, setOrderType, clearCart } =
  cartSlice.actions;

export const cartReducer = cartSlice.reducer;

// ---------------------------------------------------------------------------
// Селекторы
// ---------------------------------------------------------------------------

export const selectCartItems = (state: RootState): CartItem[] => state.cart.items;
export const selectCartBooking = (state: RootState): CartBooking | null => state.cart.booking;
export const selectOrderType = (state: RootState): OrderType => state.cart.orderType;

export const selectCartCount = createSelector(selectCartItems, (items): number =>
  items.reduce((sum, line) => sum + line.quantity, 0),
);

export const selectCartTotal = createSelector(selectCartItems, (items): number =>
  roundMoney(items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)),
);
