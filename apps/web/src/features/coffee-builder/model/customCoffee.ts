import type { CustomConfiguration, MenuItem3DConfig, MenuItemLayerConfig } from "@repo/shared";
import { roundMoney } from "@repo/shared";

/** Ингредиент конструктора «Собери свой кофе» */
export interface CoffeeIngredient {
  id: string;
  title: string;
  /** Цена за порцию, BYN */
  price: number;
  kcal: number;
  grams: number;
  colorHex: string;
}

/**
 * Каталог ингредиентов. Каждый становится «слоем» синтетического блюда
 * (priceModifier = цена ингредиента), поэтому корзина и серверный пересчёт
 * работают с ним по общим правилам калькулятора.
 */
export const COFFEE_INGREDIENTS: CoffeeIngredient[] = [
  { id: "ing_espresso", title: "Эспрессо", price: 2.5, kcal: 8, grams: 60, colorHex: "#3a2417" },
  { id: "ing_milk", title: "Молоко 3,2%", price: 1.5, kcal: 118, grams: 200, colorHex: "#f3e9d2" },
  {
    id: "ing_oat_milk",
    title: "Овсяное молоко",
    price: 2.0,
    kcal: 96,
    grams: 200,
    colorHex: "#e8dcc8",
  },
  { id: "ing_cream", title: "Сливки 11%", price: 2.2, kcal: 168, grams: 140, colorHex: "#f2e4cd" },
  { id: "ing_foam", title: "Молочная пенка", price: 0.8, kcal: 32, grams: 40, colorHex: "#fffaf0" },
  { id: "ing_ice", title: "Лёд", price: 0.5, kcal: 0, grams: 50, colorHex: "#dceef5" },
  {
    id: "ing_caramel",
    title: "Сироп «Карамель»",
    price: 1.5,
    kcal: 78,
    grams: 15,
    colorHex: "#c98a3d",
  },
  {
    id: "ing_vanilla",
    title: "Сироп «Ваниль»",
    price: 1.5,
    kcal: 74,
    grams: 15,
    colorHex: "#e8d5a8",
  },
  {
    id: "ing_salt_caramel",
    title: "Солёная карамель",
    price: 1.8,
    kcal: 80,
    grams: 18,
    colorHex: "#b06d1f",
  },
  { id: "ing_cacao", title: "Какао-пудра", price: 0.7, kcal: 11, grams: 3, colorHex: "#5b3a1e" },
  { id: "ing_cinnamon", title: "Корица", price: 0.5, kcal: 5, grams: 2, colorHex: "#8b5a2b" },
  {
    id: "ing_marshmallow",
    title: "Маршмеллоу",
    price: 1.2,
    kcal: 40,
    grams: 12,
    colorHex: "#fdf3e3",
  },
];

export const CUSTOM_COFFEE_ITEM_ID = "custom_coffee";

/** Синтетический пункт меню из выбранных ингредиентов */
export function buildCustomCoffeeItem(selected: CoffeeIngredient[]): MenuItem3DConfig {
  return {
    id: CUSTOM_COFFEE_ITEM_ID,
    categoryId: "custom",
    slug: "custom-coffee",
    name: "Свой кофе",
    description: `Собран вручную: ${selected.map((i) => i.title.toLowerCase()).join(", ") || "пусто"}`,
    basePrice: 0,
    baseCalories: 0,
    baseWeightGrams: 0,
    prepTimeMinutes: 5,
    isAvailable: true,
    isFeatured: false,
    modelUrl: null,
    previewImageUrl: null,
    cameraPreset: { position: [0, 1.8, 4.5], target: [0, 0.5, 0], fov: 42 },
    scale3D: 1,
    ambientColorHex: "#8a5a33",
    layers: selected.map(toLayer),
  };
}

function toLayer(ingredient: CoffeeIngredient, index: number): MenuItemLayerConfig {
  return {
    id: ingredient.id,
    menuItemId: CUSTOM_COFFEE_ITEM_ID,
    title: ingredient.title,
    description: null,
    meshName: ingredient.id,
    primitiveType: "CYLINDER",
    layerOrder: index,
    basePositionY: index * 0.2,
    explodeOffsetY: index * 0.6,
    heightScale: 0.15,
    radiusScale: 0.9,
    labelPosition: [1.3, 0, 0],
    isDefault: true,
    isRemovable: true,
    isOptionalAdd: false,
    priceModifier: ingredient.price,
    material: { colorHex: ingredient.colorHex, opacity: 1, roughness: 0.6 },
    nutrition: {
      calories: ingredient.kcal,
      proteins: 0,
      fats: 0,
      carbs: 0,
      weightGrams: ingredient.grams,
    },
  };
}

export interface CustomCoffeeTotals {
  price: number;
  kcal: number;
  grams: number;
  count: number;
}

export function calculateCustomCoffee(selected: CoffeeIngredient[]): CustomCoffeeTotals {
  return {
    price: roundMoney(selected.reduce((s, i) => s + i.price, 0)),
    kcal: selected.reduce((s, i) => s + i.kcal, 0),
    grams: selected.reduce((s, i) => s + i.grams, 0),
    count: selected.length,
  };
}

/** Слепок кастомизации для корзины/заказа */
export function customCoffeeConfiguration(selected: CoffeeIngredient[]): CustomConfiguration {
  return {
    activeLayerIds: selected.map((i) => i.id),
    removedTitles: [],
    addedTitles: selected.map((i) => i.title),
  };
}
