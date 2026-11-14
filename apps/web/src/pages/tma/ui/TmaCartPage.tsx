import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectCartItems,
  selectCartTotal,
  setQuantity,
} from "@/features/cart";
import { formatPrice } from "@/shared/lib";
import { Link } from "react-router";

/** Корзина Mini App — те же позиции, что на сайте. */
export function TmaCartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  if (items.length === 0) {
    return (
      <div className="wrap grid justify-items-center gap-4 py-16 text-center">
        <p className="text-cream-dim">Корзина пуста.</p>
        <Link to="/tma" className="btn btn-primary">
          К меню
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap flex flex-col gap-4 py-4">
      <h2 className="font-display text-2xl">Корзина</h2>
      <ul className="flex flex-col gap-3">
        {items.map((line) => (
          <li
            key={line.lineId}
            className="flex items-center justify-between gap-3 rounded-m border border-ink-500 bg-ink-700 p-4"
          >
            <div>
              <p className="font-medium">{line.name}</p>
              <p className="text-sm text-cream-dim">{formatPrice(line.unitPrice)} × {line.quantity}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="grid size-8 place-items-center rounded-lg border border-ink-500"
                onClick={() => dispatch(setQuantity({ lineId: line.lineId, quantity: line.quantity - 1 }))}
              >
                −
              </button>
              <span className="w-6 text-center">{line.quantity}</span>
              <button
                type="button"
                className="grid size-8 place-items-center rounded-lg border border-ink-500"
                onClick={() => dispatch(setQuantity({ lineId: line.lineId, quantity: line.quantity + 1 }))}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between font-display text-xl">
        <span>Итого</span>
        <span>{formatPrice(total)}</span>
      </div>
      <Link to="/tma/checkout" className="btn btn-primary w-full">
        Оформить
      </Link>
    </div>
  );
}
