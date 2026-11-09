import { useAppDispatch } from "@/app/store";
import { addItem } from "@/features/cart/model/cartSlice";
import { formatPrice } from "@/shared/lib";
import {
  calculateItemTotals,
  getDefaultActiveLayerIds,
  getDefaultConfiguration,
  type MenuItem3DConfig,
} from "@repo/shared";

/** Кнопка «В корзину»: добавляет блюдо в дефолтной комплектации */
export function AddToCartButton({ item }: { item: MenuItem3DConfig }) {
  const dispatch = useAppDispatch();
  const totals = calculateItemTotals(item, getDefaultActiveLayerIds(item));

  const handleAdd = (): void => {
    dispatch(
      addItem({
        item,
        configuration: getDefaultConfiguration(item),
        unitPrice: totals.unitPrice,
      }),
    );
  };

  return (
    <button type="button" onClick={handleAdd} className="btn btn-primary !min-h-0 !px-4 !py-2 text-sm">
      В корзину · {formatPrice(totals.unitPrice)}
    </button>
  );
}
