import type { DeliveryCheckResult } from "@repo/shared";
import { FREE_DELIVERY_FROM } from "@repo/shared";

interface DeliveryFieldsProps {
  street: string;
  building: string;
  apartment: string;
  zone: DeliveryCheckResult | null;
  locating: boolean;
  geoError: string | null;
  cartTotal: number;
  onStreet: (value: string) => void;
  onBuilding: (value: string) => void;
  onApartment: (value: string) => void;
  onLocate: () => void;
  onUseZoneCenter: () => void;
}

/** Адрес и проверка полигона доставки (центр Минска). */
export function DeliveryFields({
  street,
  building,
  apartment,
  zone,
  locating,
  geoError,
  cartTotal,
  onStreet,
  onBuilding,
  onApartment,
  onLocate,
  onUseZoneCenter,
}: DeliveryFieldsProps) {
  const belowMin = cartTotal < FREE_DELIVERY_FROM;

  return (
    <div className="grid gap-3 rounded-m border border-ink-500 bg-ink-700 p-4">
      <p className="text-sm text-cream-dim">
        Зона — центр Минска. Бесплатно от {FREE_DELIVERY_FROM} BYN.
      </p>
      {belowMin ? (
        <p className="text-sm text-rose-warm">Добавьте позиции до {FREE_DELIVERY_FROM} BYN.</p>
      ) : null}
      <label className="field">
        <span className="field-label">Улица</span>
        <input
          className="field-input"
          value={street}
          onChange={(event) => onStreet(event.target.value)}
          required
          autoComplete="street-address"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="field">
          <span className="field-label">Дом</span>
          <input
            className="field-input"
            value={building}
            onChange={(event) => onBuilding(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Квартира</span>
          <input
            className="field-input"
            value={apartment}
            onChange={(event) => onApartment(event.target.value)}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost" onClick={onLocate} disabled={locating}>
          {locating ? "Определяю…" : "Проверить зону"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onUseZoneCenter}>
          Точка в центре зоны
        </button>
      </div>
      {geoError ? <p className="text-sm text-rose-warm">{geoError}</p> : null}
      {zone ? (
        <p className={zone.inZone ? "text-sm text-mint" : "text-sm text-rose-warm"}>
          {zone.inZone ? "Адрес в зоне доставки." : "Эта точка вне зоны."}
        </p>
      ) : (
        <p className="text-sm text-cream-dim">Нужна геоточка, чтобы принять доставку.</p>
      )}
    </div>
  );
}
