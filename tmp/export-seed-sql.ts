// Собирает tmp/cafe-seed.sql из моков меню и учёток персонала.
// Запуск из packages/database: pnpm exec tsx ../../tmp/export-seed-sql.ts
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MOCK_CATEGORIES, MOCK_MENU_ITEMS } from "@repo/shared";
import bcrypt from "bcryptjs";

function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value === "NOW()") return "NOW()";
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
  }
  return `'${String(value).replaceAll("'", "''")}'`;
}

function insert(table: string, row: Record<string, unknown>): string {
  const columns = Object.keys(row);
  const values = columns.map((column) => sqlValue(row[column]));
  const quoted = columns.map((column) => `"${column}"`).join(", ");
  return `INSERT INTO "${table}" (${quoted}) VALUES (${values.join(", ")});`;
}

const tables = [
  { number: 1, title: "Столик №1 у панорамного окна", seats: 2, zone: "WINDOW", hasPowerOutlet: true, position3D: [-4.5, 0, -3] },
  { number: 2, title: "Столик №2 у панорамного окна", seats: 2, zone: "WINDOW", hasPowerOutlet: true, position3D: [-1.5, 0, -3] },
  { number: 3, title: "Столик №3 у панорамного окна", seats: 4, zone: "WINDOW", hasPowerOutlet: false, position3D: [1.5, 0, -3] },
  { number: 4, title: "Столик №4 у панорамного окна", seats: 4, zone: "WINDOW", hasPowerOutlet: false, position3D: [4.5, 0, -3] },
  { number: 5, title: "Столик №5 в центре зала", seats: 2, zone: "CENTER", hasPowerOutlet: false, position3D: [-3, 0, 0] },
  { number: 6, title: "Столик №6 в центре зала", seats: 4, zone: "CENTER", hasPowerOutlet: false, position3D: [0, 0, 0] },
  { number: 7, title: "Столик №7 в центре зала", seats: 6, zone: "CENTER", hasPowerOutlet: false, position3D: [3, 0, 0] },
  { number: 8, title: "Столик №8 в тихой зоне", seats: 2, zone: "QUIET", hasPowerOutlet: true, position3D: [-3, 0, 3] },
  { number: 9, title: "Столик №9 в тихой зоне", seats: 2, zone: "QUIET", hasPowerOutlet: true, position3D: [0, 0, 3] },
  { number: 10, title: "Столик №10 на террасе", seats: 4, zone: "TERRACE", hasPowerOutlet: false, position3D: [3.5, 0, 3] },
] as const;

async function main(): Promise<void> {
  const lines: string[] = ["BEGIN;"];

  for (const category of MOCK_CATEGORIES) {
    lines.push(
      insert("Category", {
        id: category.id,
        slug: category.slug,
        name: category.name,
        iconName: category.iconName,
        sortOrder: category.sortOrder,
      }),
    );
  }

  for (const item of MOCK_MENU_ITEMS) {
    lines.push(
      insert("MenuItem", {
        id: item.id,
        categoryId: item.categoryId,
        slug: item.slug,
        name: item.name,
        description: item.description,
        basePrice: item.basePrice,
        baseCalories: item.baseCalories,
        baseWeightGrams: item.baseWeightGrams,
        prepTimeMinutes: item.prepTimeMinutes,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured,
        modelUrl: item.modelUrl,
        previewImageUrl: item.previewImageUrl,
        cameraPreset: item.cameraPreset,
        scale3D: item.scale3D,
        ambientColorHex: item.ambientColorHex,
        updatedAt: "NOW()",
      }),
    );
    for (const layer of item.layers) {
      lines.push(
        insert("MenuItemLayer", {
          id: layer.id,
          menuItemId: layer.menuItemId,
          meshName: layer.meshName,
          primitiveType: layer.primitiveType,
          layerOrder: layer.layerOrder,
          basePositionY: layer.basePositionY,
          explodeOffsetY: layer.explodeOffsetY,
          heightScale: layer.heightScale,
          radiusScale: layer.radiusScale,
          labelPosition: layer.labelPosition,
          colorHex: layer.material.colorHex,
          opacity: layer.material.opacity,
          roughness: layer.material.roughness,
          title: layer.title,
          description: layer.description,
          calories: layer.nutrition.calories,
          proteins: layer.nutrition.proteins,
          fats: layer.nutrition.fats,
          carbs: layer.nutrition.carbs,
          weightGrams: layer.nutrition.weightGrams,
          isDefault: layer.isDefault,
          isRemovable: layer.isRemovable,
          isOptionalAdd: layer.isOptionalAdd,
          priceModifier: layer.priceModifier,
        }),
      );
    }
  }

  for (const table of tables) {
    lines.push(
      insert("CafeTable", {
        id: `cafe-table-${table.number}`,
        number: table.number,
        title: table.title,
        seats: table.seats,
        zone: table.zone,
        hasPowerOutlet: table.hasPowerOutlet,
        meshName: `Table_Mesh_${String(table.number).padStart(2, "0")}`,
        position3D: table.position3D,
        rotationY: 0,
      }),
    );
  }

  const staff = [
    { id: "user-admin", email: "admin@tactile.local", firstName: "Админ", role: "ADMIN", password: "admin123" },
    { id: "user-barista", email: "barista@tactile.local", firstName: "Бариста", role: "BARISTA", password: "barista123" },
  ];
  for (const account of staff) {
    lines.push(
      insert("User", {
        id: account.id,
        email: account.email,
        firstName: account.firstName,
        role: account.role,
        passwordHash: await bcrypt.hash(account.password, 10),
        updatedAt: "NOW()",
      }),
    );
  }

  lines.push("COMMIT;");

  const out = join(dirname(fileURLToPath(import.meta.url)), "cafe-seed.sql");
  writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`lines ${lines.length}`);
}

void main();
