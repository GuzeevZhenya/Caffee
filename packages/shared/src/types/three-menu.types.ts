/**
 * Строгие типы для 3D-меню (Exploded View).
 * Зеркалируют модели MenuItem / MenuItemLayer из Prisma,
 * но в сериализуемом виде (Decimal -> number, Json -> типизированные кортежи).
 * Используются и в apps/web (R3F-сцена), и в apps/bot (превью/описания).
 */

/** Кортеж координат Three.js: [x, y, z] */
export type Vector3Tuple = [x: number, y: number, z: number];

/** Ракурс камеры для React Three Fiber, хранится в MenuItem.cameraPreset (JSON) */
export interface CameraPreset {
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov: number;
}

/** Тип процедурного примитива для fallback-рендера слоя (без .glb модели) */
export const PRIMITIVE_TYPES = ["CYLINDER", "BOX", "SPHERE", "TORUS", "CUSTOM_MESH"] as const;
export type PrimitiveType = (typeof PRIMITIVE_TYPES)[number];

/** Материал слоя для процедурного рендера / шейдеров жидкости */
export interface LayerMaterialConfig {
  colorHex: string;
  /** 1.0 — непрозрачный; 0.85 — желе/лёд */
  opacity: number;
  /** 0.1 — глазурь/глянец; 0.9 — бисквит/матовый */
  roughness: number;
}

/** КБЖУ и вес одного слоя */
export interface LayerNutrition {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  weightGrams: number;
}

/** Полная конфигурация одного слоя блюда (MenuItemLayer) */
export interface MenuItemLayerConfig {
  id: string;
  menuItemId: string;

  /** Имя узла внутри .glb (для CUSTOM_MESH) */
  meshName: string;
  primitiveType: PrimitiveType;
  /** Порядок снизу вверх: 0 — основа/дно */
  layerOrder: number;

  /** Позиция Y в собранном виде */
  basePositionY: number;
  /** На сколько поднять слой в режиме Exploded View */
  explodeOffsetY: number;
  /** Толщина слоя (для процедурного рендера) */
  heightScale: number;
  /** Радиус слоя (для процедурного рендера) */
  radiusScale: number;
  /** Позиция 3D-аннотации <Html> относительно центра слоя */
  labelPosition: Vector3Tuple;

  title: string;
  description: string | null;

  /** Включен ли слой в базовый рецепт */
  isDefault: boolean;
  /** Можно ли убрать из рецепта (взбитые сливки, корица) */
  isRemovable: boolean;
  /** Дополнительный платный слой (сироп, маршмеллоу) */
  isOptionalAdd: boolean;
  /** Наценка за добавление слоя (0 для базовых) */
  priceModifier: number;

  material: LayerMaterialConfig;
  nutrition: LayerNutrition;
}

/** Блюдо меню с полной 3D-конфигурацией (MenuItem + layers) */
export interface MenuItem3DConfig {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  description: string;

  basePrice: number;
  baseCalories: number;
  baseWeightGrams: number;
  prepTimeMinutes: number;

  isAvailable: boolean;
  isFeatured: boolean;

  /** Ссылка на сжатый .glb в CDN; null — рендерим слои примитивами */
  modelUrl: string | null;
  /** 2D-превью для старых устройств и Telegram-бота */
  previewImageUrl: string | null;

  cameraPreset: CameraPreset;
  scale3D: number;
  ambientColorHex: string;

  layers: MenuItemLayerConfig[];
}

/** Категория меню */
export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  iconName: string | null;
  sortOrder: number;
}

/**
 * Слепок кастомизации блюда в конструкторе.
 * Хранится в OrderItem.customConfiguration (JSON).
 */
export interface CustomConfiguration {
  /** ID слоёв, которые войдут в заказ (базовые минус убранные плюс добавленные) */
  activeLayerIds: string[];
  /** Названия убранных слоёв (для чека и экрана бариста) */
  removedTitles: string[];
  /** Названия добавленных платных слоёв */
  addedTitles: string[];
}

/** Ответ GET /api/menu — категории и блюда с 3D-слоями */
export interface MenuResponse {
  categories: MenuCategory[];
  items: MenuItem3DConfig[];
  /** Откуда данные: БД или моки (dev-режим без Supabase) */
  source: "database" | "mock";
}
