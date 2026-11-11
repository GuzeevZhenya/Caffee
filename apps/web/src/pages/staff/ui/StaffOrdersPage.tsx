import { staffBoardError } from "./staff-error";
import { StaffSection } from "./StaffSection";
import {
  usePatchStaffOrderMutation,
  useStaffOrdersQuery,
} from "@/features/staff-board";
import { formatPrice } from "@/shared/lib";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_TYPE_LABELS, type OrderStatus } from "@repo/shared";

function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

/** `/staff/orders` — очередь заказов и смена статуса */
export function StaffOrdersPage() {
  const { data, isLoading, isError, error } = useStaffOrdersQuery();
  const [patchOrder, patchState] = usePatchStaffOrderMutation();

  return (
    <StaffSection eyebrow="Кабинет" title="Заказы">
      {isLoading ? <p className="text-cream-dim">Загружаю заказы…</p> : null}
      {isError ? <p className="text-sm text-rose-warm">{staffBoardError(error)}</p> : null}
      {patchState.isError ? (
        <p className="text-sm text-rose-warm">{staffBoardError(patchState.error)}</p>
      ) : null}
      {data ? (
        <div className="overflow-x-auto rounded-l border border-ink-500">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-cream-dim">
              <tr>
                <th className="px-4 py-3 font-medium">№</th>
                <th className="px-4 py-3 font-medium">Гость</th>
                <th className="px-4 py-3 font-medium">Состав</th>
                <th className="px-4 py-3 font-medium">Тип</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <tr key={order.id} className="border-t border-ink-500">
                  <td className="px-4 py-3 font-medium text-cream">#{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.guestName}</td>
                  <td className="px-4 py-3 text-cream-dim">{order.summary}</td>
                  <td className="px-4 py-3">{ORDER_TYPE_LABELS[order.type]}</td>
                  <td className="px-4 py-3">
                    {formatPrice(order.finalTotal)}
                    {order.isPaid ? "" : " · не оплачен"}
                  </td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`status-${order.id}`}>
                      Статус заказа #{order.orderNumber}
                    </label>
                    <select
                      id={`status-${order.id}`}
                      className="field-input min-w-36"
                      value={order.status}
                      disabled={patchState.isLoading}
                      onChange={(event) => {
                        if (!isOrderStatus(event.target.value)) return;
                        void patchOrder({ id: order.id, status: event.target.value });
                      }}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.orders.length === 0 ? (
            <p className="px-4 py-6 text-sm text-cream-dim">Заказов пока нет.</p>
          ) : null}
        </div>
      ) : null}
    </StaffSection>
  );
}
