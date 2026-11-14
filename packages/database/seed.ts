import {
  MOCK_CATEGORIES,
  MOCK_MENU_ITEMS,
  calculateItemTotals,
  getDefaultActiveLayerIds,
} from "@repo/shared";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "./src/client";

/**
 * Начальное наполнение БД:
 *  - 4 категории меню;
 *  - 12 блюд с полной раскладкой по слоям (из @repo/shared моков);
 *  - 10 столиков зала с координатами для 3D-диорамы.
 *
 * Идемпотентно: категории/блюда/столы делаются через upsert по slug/id/number,
 * слои пересоздаются (deleteMany + createMany), чтобы сид всегда
 * приводил состав к эталонному состоянию из моков.
 */
async function main(): Promise<void> {
  console.log("🌱 Сидирую базу Tactile Craft Coffee...");

  // --- Категории -----------------------------------------------------------
  for (const category of MOCK_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        iconName: category.iconName,
        sortOrder: category.sortOrder,
      },
      create: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        iconName: category.iconName,
        sortOrder: category.sortOrder,
      },
    });
  }
  console.log(`  ✔ Категории: ${MOCK_CATEGORIES.length}`);

  // --- Блюда и слои ----------------------------------------------------------
  for (const item of MOCK_MENU_ITEMS) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {
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
        cameraPreset: item.cameraPreset as unknown as Prisma.InputJsonValue,
        scale3D: item.scale3D,
        ambientColorHex: item.ambientColorHex,
      },
      create: {
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
        cameraPreset: item.cameraPreset as unknown as Prisma.InputJsonValue,
        scale3D: item.scale3D,
        ambientColorHex: item.ambientColorHex,
      },
    });

    // Слои пересоздаём целиком — состав всегда соответствует мокам
    await prisma.menuItemLayer.deleteMany({ where: { menuItemId: item.id } });
    await prisma.menuItemLayer.createMany({
      data: item.layers.map((layer) => ({
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
      })),
    });
  }
  console.log(
    `  ✔ Блюда: ${MOCK_MENU_ITEMS.length}, слоёв: ${MOCK_MENU_ITEMS.reduce(
      (sum, item) => sum + item.layers.length,
      0,
    )}`,
  );

  // --- Столики зала ----------------------------------------------------------
  // Сетка зала 12×9 м: 2 ряда у окна, центр, тихая зона, терраса.
  const tables = [
    {
      number: 1,
      title: "Столик №1 у панорамного окна",
      seats: 2,
      zone: "WINDOW",
      hasPowerOutlet: true,
      position3D: [-4.5, 0, -3],
    },
    {
      number: 2,
      title: "Столик №2 у панорамного окна",
      seats: 2,
      zone: "WINDOW",
      hasPowerOutlet: true,
      position3D: [-1.5, 0, -3],
    },
    {
      number: 3,
      title: "Столик №3 у панорамного окна",
      seats: 4,
      zone: "WINDOW",
      hasPowerOutlet: false,
      position3D: [1.5, 0, -3],
    },
    {
      number: 4,
      title: "Столик №4 у панорамного окна",
      seats: 4,
      zone: "WINDOW",
      hasPowerOutlet: false,
      position3D: [4.5, 0, -3],
    },
    {
      number: 5,
      title: "Столик №5 в центре зала",
      seats: 2,
      zone: "CENTER",
      hasPowerOutlet: false,
      position3D: [-3, 0, 0],
    },
    {
      number: 6,
      title: "Столик №6 в центре зала",
      seats: 4,
      zone: "CENTER",
      hasPowerOutlet: false,
      position3D: [0, 0, 0],
    },
    {
      number: 7,
      title: "Столик №7 в центре зала",
      seats: 6,
      zone: "CENTER",
      hasPowerOutlet: false,
      position3D: [3, 0, 0],
    },
    {
      number: 8,
      title: "Столик №8 в тихой зоне",
      seats: 2,
      zone: "QUIET",
      hasPowerOutlet: true,
      position3D: [-3, 0, 3],
    },
    {
      number: 9,
      title: "Столик №9 в тихой зоне",
      seats: 2,
      zone: "QUIET",
      hasPowerOutlet: true,
      position3D: [0, 0, 3],
    },
    {
      number: 10,
      title: "Столик №10 на террасе",
      seats: 4,
      zone: "TERRACE",
      hasPowerOutlet: false,
      position3D: [3.5, 0, 3],
    },
  ] as const;

  for (const table of tables) {
    await prisma.cafeTable.upsert({
      where: { number: table.number },
      update: {
        title: table.title,
        seats: table.seats,
        zone: table.zone,
        hasPowerOutlet: table.hasPowerOutlet,
        position3D: table.position3D,
      },
      create: {
        number: table.number,
        title: table.title,
        seats: table.seats,
        zone: table.zone,
        hasPowerOutlet: table.hasPowerOutlet,
        meshName: `Table_Mesh_${String(table.number).padStart(2, "0")}`,
        position3D: table.position3D,
      },
    });
  }
  console.log(`  ✔ Столики: ${tables.length}`);

  // --- Персонал (срез 1 админки) -------------------------------------------
  const staffAccounts = [
    {
      email: "admin@tactile.local",
      firstName: "Админ",
      role: "ADMIN" as const,
      password: "admin123",
    },
    {
      email: "barista@tactile.local",
      firstName: "Бариста",
      role: "BARISTA" as const,
      password: "barista123",
    },
  ];
  for (const account of staffAccounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    await prisma.user.upsert({
      where: { email: account.email },
      update: {
        firstName: account.firstName,
        role: account.role,
        passwordHash,
      },
      create: {
        email: account.email,
        firstName: account.firstName,
        role: account.role,
        passwordHash,
      },
    });
  }
  console.log(`  ✔ Персонал: ${staffAccounts.length} (admin@ / barista@)`);

  const guest = await prisma.user.upsert({
    where: { email: "guest@tactile.local" },
    update: { firstName: "Гость" },
    create: {
      email: "guest@tactile.local",
      firstName: "Гость",
    },
  });

  const latte = await prisma.menuItem.findUnique({ where: { slug: "latte-classic" } });
  const latteMock = MOCK_MENU_ITEMS.find((item) => item.slug === "latte-classic");
  if (latte && latteMock) {
    const activeLayerIds = getDefaultActiveLayerIds(latteMock);
    const totals = calculateItemTotals(latteMock, activeLayerIds);
    const existingDemo = await prisma.order.findFirst({ where: { orderNumber: 1045 } });
    if (existingDemo) {
      await prisma.order.update({
        where: { id: existingDemo.id },
        data: { status: "COOKING_HOLD", isTriggeredByGuest: false, isPaid: true },
      });
    } else {
      await prisma.order.create({
        data: {
          id: "demo-order-1045",
          orderNumber: 1045,
          userId: guest.id,
          type: "DINE_IN",
          status: "COOKING_HOLD",
          itemsTotal: totals.unitPrice,
          finalTotal: totals.unitPrice,
          isPaid: true,
          items: {
            create: {
              menuItemId: latte.id,
              quantity: 1,
              unitPrice: totals.unitPrice,
              totalPrice: totals.unitPrice,
              customConfiguration: {
                activeLayerIds,
                removedTitles: [],
                addedTitles: [],
              },
            },
          },
        },
      });
    }
    console.log("  ✔ Демо-заказ #1045 (COOKING_HOLD) для бота");
  }

  console.log("✅ Сидирование завершено");
}

main()
  .catch((error: unknown) => {
    console.error("❌ Ошибка сидирования:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
