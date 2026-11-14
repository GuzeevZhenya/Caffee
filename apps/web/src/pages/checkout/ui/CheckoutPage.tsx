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
import {
  formatPrice,
  readLastOrder,
  requestDeliveryPoint,
  safeOrderErrorMessage,
  writeLastOrder,
} from "@/shared/lib";
import {
  checkDeliveryPoint,
  deliveryZoneCentroid,
  FREE_DELIVERY_FROM,
  type CreateOrderInput,
  type DeliveryCheckResult,
  type OrderType,
} from "@repo/shared";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { DeliveryFields } from "./DeliveryFields";
import { OrderStatusCard } from "./OrderStatusCard";

/** Корзина и оформление заказа */
export function CheckoutPage() {
  const location = useLocation();
  const isTma = location.pathname.startsWith("/tma");
  const menuTo = isTma ? "/tma" : "/menu";
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const booking = useAppSelector(selectCartBooking);
  const orderType = useAppSelector(selectOrderType);
  const [createOrder, { data: created, isLoading, error }] = useCreateOrderMutation();
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [apartment, setApartment] = useState("");
  const [zone, setZone] = useState<DeliveryCheckResult | null>(null);
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!created) return;
    writeLastOrder({ orderId: created.orderId, orderNumber: created.orderNumber });
  }, [created]);

  const lastOrder = created
    ? {
        orderId: created.orderId,
        orderNumber: created.orderNumber,
        finalTotal: created.finalTotal,
      }
    : readLastOrder();

  const canDineIn = Boolean(booking?.bookingId);
  const deliveryReady =
    street.trim().length > 0 &&
    building.trim().length > 0 &&
    Boolean(point && zone?.inZone) &&
    total >= FREE_DELIVERY_FROM;
  const canSubmit =
    items.length > 0 &&
    !isLoading &&
    (orderType === "TAKEAWAY" ||
      (orderType === "DINE_IN" && canDineIn) ||
      (orderType === "DELIVERY" && deliveryReady));

  const applyPoint = (next: { lat: number; lng: number }): void => {
    setPoint(next);
    setZone(checkDeliveryPoint(next));
    setGeoError(null);
  };

  const handleLocate = (): void => {
    setLocating(true);
    setGeoError(null);
    void requestDeliveryPoint()
      .then(applyPoint)
      .catch((locateError: unknown) => {
        setGeoError(locateError instanceof Error ? locateError.message : "Не удалось определить место");
      })
      .finally(() => setLocating(false));
  };

  const handleSubmit = async (): Promise<void> => {
    const payload: CreateOrderInput = {
      type:
        orderType === "DINE_IN" && canDineIn
          ? "DINE_IN"
          : orderType === "DELIVERY"
            ? "DELIVERY"
            : "TAKEAWAY",
      bonusSpent: 0,
      bookingId: orderType === "DINE_IN" && booking?.bookingId ? booking.bookingId : undefined,
      items: items.map((line) => ({
        menuItemId: line.menuItemId,
        quantity: line.quantity,
        customConfiguration: line.configuration,
      })),
    };
    if (payload.type === "DELIVERY" && point) {
      payload.deliveryAddress = {
        title: "Доставка",
        street: street.trim(),
        building: building.trim(),
        apartment: apartment.trim() || undefined,
        latitude: point.lat,
        longitude: point.lng,
        isDefault: true,
      };
    }
    try {
      await createOrder(payload).unwrap();
      dispatch(clearCart());
    } catch {
      // Ошибка отображается ниже из состояния мутации
    }
  };

  const selectType = (type: OrderType): void => {
    if (type === "DINE_IN" && !canDineIn) return;
    dispatch(setOrderType(type));
  };

  if (lastOrder && items.length === 0) {
    return (
      <OrderStatusCard
        orderId={lastOrder.orderId}
        orderNumber={lastOrder.orderNumber}
        finalTotal={"finalTotal" in lastOrder ? lastOrder.finalTotal : undefined}
        menuTo={menuTo}
      />
    );
  }

  return (
    <div className={`wrap flex flex-col gap-6 pb-16 ${isTma ? "pt-2" : "pt-16"}`}>
      <div>
        <p className="eyebrow">Заказ</p>
        <h1 className="section-title">Корзина и оформление</h1>
      </div>

      {items.length === 0 ? (
        <div className="grid justify-items-center gap-4 py-20 text-center">
          <p className="text-cream-dim">Пока пусто — загляните в меню.</p>
          <Link to={menuTo} className="btn btn-primary">
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
          {booking.bookingId ? null : (
            <span className="mt-1 block text-cream-dim">
              Холд только в Redis — для заказа «в кафе» нужна доступная БД (Booking id).
            </span>
          )}
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Тип заказа</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectType("TAKEAWAY")}
              className="chip"
              aria-pressed={orderType === "TAKEAWAY"}
            >
              С собой
            </button>
            <button
              type="button"
              onClick={() => selectType("DINE_IN")}
              disabled={!canDineIn}
              title={
                canDineIn
                  ? "Предзаказ к забронированному столику"
                  : "Сначала удержите столик на странице «Столы»"
              }
              className={`chip ${canDineIn ? "" : "cursor-not-allowed opacity-40"}`}
              aria-pressed={orderType === "DINE_IN"}
            >
              В кафе
            </button>
            <button
              type="button"
              onClick={() => selectType("DELIVERY")}
              className="chip"
              aria-pressed={orderType === "DELIVERY"}
            >
              Доставка
            </button>
          </div>
        </div>
      ) : null}

      {items.length > 0 && orderType === "DELIVERY" ? (
        <DeliveryFields
          street={street}
          building={building}
          apartment={apartment}
          zone={zone}
          locating={locating}
          geoError={geoError}
          cartTotal={total}
          onStreet={setStreet}
          onBuilding={setBuilding}
          onApartment={setApartment}
          onLocate={handleLocate}
          onUseZoneCenter={() => applyPoint(deliveryZoneCentroid())}
        />
      ) : null}

      {items.length > 0 ? (
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
      ) : null}
      <p className="text-sm text-cream-dim">
        Оформляя заказ, вы соглашаетесь с{" "}
        <Link to="/privacy">политикой обработки персональных данных</Link>.
      </p>

      {error ? <p className="text-sm text-rose-warm">{safeOrderErrorMessage(error)}</p> : null}
    </div>
  );
}
