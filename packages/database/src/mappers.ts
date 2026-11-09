import type { CafeTable, MenuItem, MenuItemLayer } from "@prisma/client";
import type {
  CafeTableConfig,
  CameraPreset,
  MenuItem3DConfig,
  MenuItemLayerConfig,
  PrimitiveType,
  TableCameraFocus,
  TableZone,
  Vector3Tuple,
} from "@repo/shared";

/**
 * Мапперы Prisma → shared-типы.
 * Prisma отдаёт Decimal, а JSON-поля — как Prisma.JsonValue;
 * shared-типы строгие (number, кортежи), поэтому конверсия в одном месте.
 */

function isNumberArray3(value: unknown): value is [number, number, number] {
  return Array.isArray(value) && value.length === 3 && value.every((v) => typeof v === "number");
}

function asVector3(value: unknown, fallback: Vector3Tuple): Vector3Tuple {
  return isNumberArray3(value) ? [value[0], value[1], value[2]] : fallback;
}

function asCameraPreset(value: unknown): CameraPreset {
  const fallback: CameraPreset = { position: [0, 1.8, 4.5], target: [0, 0.5, 0], fov: 42 };
  if (typeof value !== "object" || value === null) return fallback;
  const preset = value as Record<string, unknown>;
  return {
    position: asVector3(preset.position, fallback.position),
    target: asVector3(preset.target, fallback.target),
    fov: typeof preset.fov === "number" ? preset.fov : fallback.fov,
  };
}

function asCameraFocus(value: unknown): TableCameraFocus | null {
  if (typeof value !== "object" || value === null) return null;
  const focus = value as Record<string, unknown>;
  if (!isNumberArray3(focus.position) || !isNumberArray3(focus.target)) return null;
  return {
    position: [focus.position[0], focus.position[1], focus.position[2]],
    target: [focus.target[0], focus.target[1], focus.target[2]],
  };
}

export function toMenuItemLayerConfig(layer: MenuItemLayer): MenuItemLayerConfig {
  return {
    id: layer.id,
    menuItemId: layer.menuItemId,
    meshName: layer.meshName,
    primitiveType: layer.primitiveType as PrimitiveType,
    layerOrder: layer.layerOrder,
    basePositionY: layer.basePositionY,
    explodeOffsetY: layer.explodeOffsetY,
    heightScale: layer.heightScale,
    radiusScale: layer.radiusScale,
    labelPosition: asVector3(layer.labelPosition, [1.3, 0, 0]),
    title: layer.title,
    description: layer.description,
    isDefault: layer.isDefault,
    isRemovable: layer.isRemovable,
    isOptionalAdd: layer.isOptionalAdd,
    priceModifier: Number(layer.priceModifier),
    material: {
      colorHex: layer.colorHex,
      opacity: layer.opacity,
      roughness: layer.roughness,
    },
    nutrition: {
      calories: layer.calories,
      proteins: layer.proteins,
      fats: layer.fats,
      carbs: layer.carbs,
      weightGrams: layer.weightGrams,
    },
  };
}

export function toMenuItem3DConfig(item: MenuItem & { layers: MenuItemLayer[] }): MenuItem3DConfig {
  return {
    id: item.id,
    categoryId: item.categoryId,
    slug: item.slug,
    name: item.name,
    description: item.description,
    basePrice: Number(item.basePrice),
    baseCalories: item.baseCalories,
    baseWeightGrams: item.baseWeightGrams,
    prepTimeMinutes: item.prepTimeMinutes,
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    modelUrl: item.modelUrl,
    previewImageUrl: item.previewImageUrl,
    cameraPreset: asCameraPreset(item.cameraPreset),
    scale3D: item.scale3D,
    ambientColorHex: item.ambientColorHex,
    layers: item.layers.map(toMenuItemLayerConfig).sort((a, b) => a.layerOrder - b.layerOrder),
  };
}

export function toCafeTableConfig(table: CafeTable): CafeTableConfig {
  return {
    id: table.id,
    number: table.number,
    title: table.title,
    seats: table.seats,
    zone: table.zone as TableZone,
    hasPowerOutlet: table.hasPowerOutlet,
    minDeposit: Number(table.minDeposit),
    isActive: table.isActive,
    meshName: table.meshName,
    position3D: asVector3(table.position3D, [0, 0, 0]),
    rotationY: table.rotationY,
    cameraFocus: asCameraFocus(table.cameraFocus),
  };
}
