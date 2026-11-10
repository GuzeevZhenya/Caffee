import { useAppDispatch, useAppSelector } from "@/app/store";
import { useCreateOrderMutation } from "@/entities/order";
import {
  clearCart,
  selectCartBooking,
  selectCartItems,
  selectCartTotal,
  selectOrderType,
  setOrderType,
  setQuantity,
} from "@/features/cart";
import { formatPrice, safeOrderErrorMessage } from "@/shared/lib";
import type { CreateOrderInput } from "@repo/shared";
import { Link } from "react-router";

/** Корзина и оформление заказа (дизайн mockup/checkout.html) */
export function CheckoutPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const booking = useAppSelector(selectCartBooking);
  const orderType = useAppSelector(selectOrderType);
  const [createOrder, { data: created, isLoading, error }] = useCreateOrderMutation();

  // TODO(Фаза 4): DINE_IN — после создания Booking в БД (сейчас только Redis-холд).
  // TODO(Фаза 5): DELIVERY — после адресов и зон доставки.
  const canSubmit = items.length > 0 && orderType === "TAKEAWAY" && !isLoading;

  const handleSubmit = async (): Promise<void> => {
    const payload: CreateOrderInput = {
      type: "TAKEAWAY",
      bonusSpent: 0,
      items: items.map((line) => ({
        menuItemId: line.menuItemId,
        quantity: line.quantity,
        customConfiguration: line.configuration,
      })),
    };
    try {
      await createOrder(payload).unwrap();
      dispatch(clearCart());
    } catch {
      // Ошибка отображается ниже из состояния мутации
    }
  };

  if (created) {
    return (
      <div className="wrap flex flex-col gap-3 py-16">
        <p className="eyebrow">Готово</p>
        <h1 className="section-title">Заказ создан 🎉</h1>
        <p>
          Номер заказа: <span className="font-mono font-bold">#{created.orderNumber}</span>
        </p>
        <p>
          Статус: <span className="font-mono">{created.status}</span> · Итого:{" "}
          {formatPrice(created.finalTotal)}
        </p>
      </div>
    );
  }

  return (
    <div className="wrap flex flex-col gap-6 pb-16 pt-16">
      <div>
        <p className="eyebrow">Заказ</p>
        <h1 className="section-title">Корзина и оформление</h1>
      </div>

      {items.length === 0 ? (
        <div className="grid justify-items-center gap-4 py-20 text-center">
          <p className="text-cream-dim">Пока пусто — загляните в меню.</p>
          <Link to="/menu" className="btn btn-primary">
            Смотреть меню
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((line) => (
            <li
              key={line.lineId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-500 bg-ink-700 p-4"
            >
              <div>
                <p className="font-medium">{line.name}</p>
                {line.configuration.removedTitles.length > 0 ? (
                  <p className="text-xs text-cream-dim">
                    без: {line.configuration.removedTitles.join(", ")}
                  </p>
                ) : null}
                {line.configuration.addedTitles.length > 0 ? (
                  <p className="text-xs text-cream-dim">
                    доп: {line.configuration.addedTitles.join(", ")}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Убавить"
                  onClick={() =>
                    dispatch(setQuantity({ lineId: line.lineId, quantity: line.quantity - 1 }))
                  }
                  className="grid size-8 place-items-center rounded-lg border border-ink-500 text-cream transition hover:border-gold"
                >
                  −
                </button>
                <span className="w-6 text-center font-mono">{line.quantity}</span>
                <button
                  type="button"
                  aria-label="Прибавить"
                  onClick={() =>
                    dispatch(setQuantity({ lineId: line.lineId, quantity: line.quantity + 1 }))
                  }
                  className="grid size-8 place-items-center rounded-lg border border-ink-500 text-cream transition hover:border-gold"
                >
                  +
                </button>
                <span className="ml-3 w-24 text-right font-display font-bold">
                  {formatPrice(line.unitPrice * line.quantity)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {booking ? (
        <p className="rounded-m border border-mint/40 bg-mint/10 px-4 py-3 text-sm text-mint">
          Привязан столик: {booking.tableTitle} ·{" "}
          {new Date(booking.slotStart).toLocaleString("ru-RU")}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Тип заказа</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => dispatch(setOrderType("TAKEAWAY"))}
            className="chip"
            aria-pressed={orderType === "TAKEAWAY"}
          >
            С собой
          </button>
          <button
            type="button"
            disabled
            title="Фаза 4: станет доступно после создания брони в БД (сейчас столик держит Redis-холд)"
            className="chip cursor-not-allowed opacity-40"
          >
            В кафе (Фаза 4)
          </button>
          <button
            type="button"
            disabled
            title="Фаза 5: появится вместе с адресами и зонами доставки в Telegram-боте"
            className="chip cursor-not-allowed opacity-40"
          >
            Доставка (Фаза 5)
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-500 pt-4">
        <span className="font-display text-lg font-bold">Итого: {formatPrice(total)}</span>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => void handleSubmit()}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? "Оформляю…" : "Оформить заказ"}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-warm">{safeOrderErrorMessage(error)}</p> : null}
    </div>
  );
}
