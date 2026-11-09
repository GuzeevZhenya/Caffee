import type {
  CustomConfiguration,
  LayerNutrition,
  MenuItem3DConfig,
  MenuItemLayerConfig,
} from "../types/three-menu.types";

/**
 * Чистые функции расчёта цены и КБЖУ кастомизированного блюда.
 * Одинаково работают на фронте (customizerSlice), в API (создание заказа)
 * и в боте (показ итога перед подтверждением) — единый источник правды.
 */

/** Итоговые показатели блюда с учётом кастомизации */
export interface CustomItemTotals extends LayerNutrition {
  /** Цена за 1 шт: basePrice + сумма priceModifier активных слоёв */
  unitPrice: number;
  /** Сумма наценок за дополнительные слои */
  modifiersTotal: number;
  /** Активные слои в порядке снизу вверх */
  activeLayers: MenuItemLayerConfig[];
}

/** Округление денег до копеек (защита от артефактов float) */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** ID слоёв базового рецепта (isDefault и не опциональные добавки) */
export function getDefaultActiveLayerIds(item: MenuItem3DConfig): string[] {
  return item.layers
    .filter((layer) => layer.isDefault && !layer.isOptionalAdd)
    .map((layer) => layer.id);
}

/** Дефолтный слепок кастомизации для блюда «как в меню» */
export function getDefaultConfiguration(item: MenuItem3DConfig): CustomConfiguration {
  return {
    activeLayerIds: getDefaultActiveLayerIds(item),
    removedTitles: [],
    addedTitles: [],
  };
}

/**
 * Пересчёт цены и КБЖУ по набору активных слоёв.
 *
 * Правила:
 * - unitPrice = basePrice + Σ priceModifier активных слоёв
 *   (у базовых слоёв priceModifier = 0, платные добавки накидывают свою цену);
 * - удаление базового слоя НЕ уменьшает цену, но уменьшает КБЖУ и вес;
 * - КБЖУ = baseCalories блюда + Σ показателей активных слоёв
 *   (поэтому baseCalories в моках = 0 — вся пищевая ценность живёт в слоях).
 */
export function calculateItemTotals(
  item: MenuItem3DConfig,
  activeLayerIds: readonly string[],
): CustomItemTotals {
  const activeSet = new Set(activeLayerIds);
  const activeLayers = item.layers
    .filter((layer) => activeSet.has(layer.id))
    .sort((a, b) => a.layerOrder - b.layerOrder);

  let modifiersTotal = 0;
  let calories = item.baseCalories;
  let proteins = 0;
  let fats = 0;
  let carbs = 0;
  let weightGrams = item.baseWeightGrams;

  for (const layer of activeLayers) {
    modifiersTotal += layer.priceModifier;
    calories += layer.nutrition.calories;
    proteins += layer.nutrition.proteins;
    fats += layer.nutrition.fats;
    carbs += layer.nutrition.carbs;
    weightGrams += layer.nutrition.weightGrams;
  }

  return {
    unitPrice: roundMoney(item.basePrice + modifiersTotal),
    modifiersTotal: roundMoney(modifiersTotal),
    calories,
    proteins: roundMoney(proteins),
    fats: roundMoney(fats),
    carbs: roundMoney(carbs),
    weightGrams,
    activeLayers,
  };
}

/** Разница между текущей конфигурацией и рецептом по умолчанию */
export function diffConfiguration(
  item: MenuItem3DConfig,
  activeLayerIds: readonly string[],
): Pick<CustomConfiguration, "removedTitles" | "addedTitles"> {
  const defaultIds = new Set(getDefaultActiveLayerIds(item));
  const activeIds = new Set(activeLayerIds);

  const removedTitles = item.layers
    .filter((layer) => defaultIds.has(layer.id) && !activeIds.has(layer.id))
    .map((layer) => layer.title);

  const addedTitles = item.layers
    .filter((layer) => !defaultIds.has(layer.id) && activeIds.has(layer.id))
    .map((layer) => layer.title);

  return { removedTitles, addedTitles };
}

/** Собрать полный слепок CustomConfiguration для OrderItem из набора активных слоёв */
export function buildConfiguration(
  item: MenuItem3DConfig,
  activeLayerIds: readonly string[],
): CustomConfiguration {
  return {
    activeLayerIds: [...activeLayerIds],
    ...diffConfiguration(item, activeLayerIds),
  };
}
