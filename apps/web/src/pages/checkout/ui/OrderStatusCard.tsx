import { useGetOrderStatusQuery } from "@/entities/order";
import { formatPrice } from "@/shared/lib";
import { ORDER_STATUS_LABELS } from "@repo/shared";
import { Link } from "react-router";

interface OrderStatusCardProps {
  orderId: string;
  orderNumber: number;
  finalTotal?: number;
  menuTo: string;
}

/** Статус оформленного заказа с опросом API. */
export function OrderStatusCard({
  orderId,
  orderNumber,
  finalTotal,
  menuTo,
}: OrderStatusCardProps) {
  const { data, isError, isLoading } = useGetOrderStatusQuery(orderId, { pollingInterval: 4_000 });
  const status = data?.status;
  const label = status
    ? ORDER_STATUS_LABELS[status]
    : isLoading
      ? "Обновляю статус…"
      : "Оформлен";

  return (
    <div className="wrap flex flex-col gap-4 py-8">
      <p className="eyebrow">Заказ</p>
      <h1 className="section-title">#{orderNumber}</h1>
      <p className="font-display text-2xl text-gold">{label}</p>
      {finalTotal !== undefined ? <p>Итого: {formatPrice(finalTotal)}</p> : null}
      {isError ? (
        <p className="text-sm text-cream-dim">Статус обновится, когда API будет доступен.</p>
      ) : null}
      <Link to={menuTo} className="btn btn-primary w-fit">
        В меню
      </Link>
    </div>
  );
}
