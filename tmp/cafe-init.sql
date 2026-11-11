BEGIN;
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'BARISTA', 'COURIER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PrimitiveType" AS ENUM ('CYLINDER', 'BOX', 'SPHERE', 'TORUS', 'CUSTOM_MESH');

-- CreateEnum
CREATE TYPE "TableZone" AS ENUM ('WINDOW', 'CENTER', 'QUIET', 'TERRACE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('HELD', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COOKING_HOLD', 'COOKING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT,
    "username" TEXT,
    "firstName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "bonusPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "apartment" TEXT,
    "entrance" TEXT,
    "floor" TEXT,
    "intercom" TEXT,
    "comment" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "baseCalories" INTEGER NOT NULL DEFAULT 0,
    "baseWeightGrams" INTEGER NOT NULL DEFAULT 0,
    "prepTimeMinutes" INTEGER NOT NULL DEFAULT 5,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "modelUrl" TEXT,
    "previewImageUrl" TEXT,
    "cameraPreset" JSONB NOT NULL DEFAULT '{"position": [0, 1.8, 4.5], "target": [0, 0.5, 0], "fov": 42}',
    "scale3D" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "ambientColorHex" TEXT NOT NULL DEFAULT '#ffffff',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItemLayer" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "meshName" TEXT NOT NULL,
    "primitiveType" "PrimitiveType" NOT NULL DEFAULT 'CYLINDER',
    "layerOrder" INTEGER NOT NULL,
    "basePositionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "explodeOffsetY" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "heightScale" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "radiusScale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "labelPosition" JSONB NOT NULL DEFAULT '[1.2, 0, 0]',
    "colorHex" TEXT NOT NULL DEFAULT '#6F4E37',
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "roughness" DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "proteins" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fats" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weightGrams" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "isRemovable" BOOLEAN NOT NULL DEFAULT false,
    "isOptionalAdd" BOOLEAN NOT NULL DEFAULT false,
    "priceModifier" DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "MenuItemLayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CafeTable" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 2,
    "zone" "TableZone" NOT NULL DEFAULT 'CENTER',
    "hasPowerOutlet" BOOLEAN NOT NULL DEFAULT false,
    "minDeposit" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "meshName" TEXT NOT NULL,
    "position3D" JSONB NOT NULL,
    "rotationY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cameraFocus" JSONB,

    CONSTRAINT "CafeTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "guestsCount" INTEGER NOT NULL DEFAULT 2,
    "status" "BookingStatus" NOT NULL DEFAULT 'HELD',
    "holdExpiresAt" TIMESTAMP(3),
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "specialRequests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL DEFAULT 'DINE_IN',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "bookingId" TEXT,
    "scheduledCookTime" TIMESTAMP(3),
    "isTriggeredByGuest" BOOLEAN NOT NULL DEFAULT false,
    "addressId" TEXT,
    "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "estimatedDeliveryTime" TIMESTAMP(3),
    "itemsTotal" DECIMAL(10,2) NOT NULL,
    "bonusSpent" INTEGER NOT NULL DEFAULT 0,
    "finalTotal" DECIMAL(10,2) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentIntentId" TEXT,
    "telegramMessageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "customConfiguration" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_telegramId_idx" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_slug_key" ON "MenuItem"("slug");

-- CreateIndex
CREATE INDEX "MenuItem_categoryId_isAvailable_idx" ON "MenuItem"("categoryId", "isAvailable");

-- CreateIndex
CREATE INDEX "MenuItemLayer_menuItemId_layerOrder_idx" ON "MenuItemLayer"("menuItemId", "layerOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CafeTable_number_key" ON "CafeTable"("number");

-- CreateIndex
CREATE UNIQUE INDEX "CafeTable_meshName_key" ON "CafeTable"("meshName");

-- CreateIndex
CREATE INDEX "Booking_tableId_startTime_endTime_status_idx" ON "Booking"("tableId", "startTime", "endTime", "status");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

-- CreateIndex
CREATE INDEX "Order_bookingId_idx" ON "Order"("bookingId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemLayer" ADD CONSTRAINT "MenuItemLayer_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "CafeTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
INSERT INTO "Category" ("id", "slug", "name", "iconName", "sortOrder") VALUES ('cat_coffee', 'coffee', 'Кофе', 'coffee', 0);
INSERT INTO "Category" ("id", "slug", "name", "iconName", "sortOrder") VALUES ('cat_signature', 'signature-drinks', 'Авторские напитки', 'sparkles', 1);
INSERT INTO "Category" ("id", "slug", "name", "iconName", "sortOrder") VALUES ('cat_tea_matcha', 'tea-matcha', 'Чай и матча', 'leaf', 2);
INSERT INTO "Category" ("id", "slug", "name", "iconName", "sortOrder") VALUES ('cat_desserts', 'desserts', 'Десерты', 'cake-slice', 3);
INSERT INTO "Category" ("id", "slug", "name", "iconName", "sortOrder") VALUES ('cat_bakery', 'bakery', 'Выпечка', 'croissant', 4);
INSERT INTO "Category" ("id", "slug", "name", "iconName", "sortOrder") VALUES ('cat_breakfast', 'breakfast', 'Завтраки и сэндвичи', 'croissant', 5);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_latte_classic', 'cat_coffee', 'latte-classic', 'Латте Классический', 'Двойной эспрессо на зерне Бразилия Серрадо, нежное молоко 3.2% и плотная бархатная пенка.', 6.5, 0, 0, 4, true, true, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#f7ead9', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_latte_espresso', 'item_latte_classic', 'layer_latte_espresso', 'CYLINDER', 0, 0, 0, 0.35, 0.92, '[1.3,0,0]'::jsonb, '#3a2417', 1, 0.25, 'Двойной эспрессо (Бразилия Серрадо)', 'Орехово-шоколадный профиль, 60 мл', 8, 0, 0, 1.4, 60, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_latte_milk', 'item_latte_classic', 'layer_latte_milk', 'CYLINDER', 1, 0.35, 0.7, 0.55, 0.95, '[1.3,0,0]'::jsonb, '#f3e9d2', 1, 0.55, 'Молоко 3.2%, взбитое паром', 'Можно заменить на овсяное в настройках', 118, 6, 6.4, 9.4, 200, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_latte_foam', 'item_latte_classic', 'layer_latte_foam', 'CYLINDER', 2, 0.9, 1.4, 0.25, 0.9, '[1.3,0,0]'::jsonb, '#fffaf0', 1, 0.9, 'Молочная пенка', NULL, 32, 1.7, 1.8, 2.5, 40, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_latte_syrup_caramel', 'item_latte_classic', 'layer_latte_syrup_caramel', 'CYLINDER', 3, 1.15, 2, 0.08, 0.85, '[1.3,0,0]'::jsonb, '#c98a3d', 0.9, 0.15, 'Сироп «Солёная карамель»', 'Дополнительный слой, 15 мл', 78, 0, 0, 19, 15, false, false, true, 1.5);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_latte_cinnamon', 'item_latte_classic', 'layer_latte_cinnamon', 'CYLINDER', 4, 1.16, 2.6, 0.03, 0.8, '[1.3,0,0]'::jsonb, '#8b5a2b', 1, 0.95, 'Корица цейлонская', NULL, 5, 0, 0, 1.2, 2, false, false, true, 0.5);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_raf_salted_caramel', 'cat_signature', 'raf-salted-caramel', 'Раф «Солёная карамель»', 'Сливочный, тёплый, с карамельной глубиной и щепоткой морской соли — наш самый заказываемый раф.', 9.8, 0, 0, 5, true, true, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#f5e6d0', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_raf_espresso', 'item_raf_salted_caramel', 'layer_raf_espresso', 'CYLINDER', 0, 0, 0, 0.35, 0.9, '[1.3,0,0]'::jsonb, '#3a2417', 1, 0.25, 'Эспрессо', NULL, 8, 0, 0, 1.4, 40, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_raf_cream', 'item_raf_salted_caramel', 'layer_raf_cream', 'CYLINDER', 1, 0.35, 0.7, 0.55, 0.95, '[1.3,0,0]'::jsonb, '#f2e4cd', 1, 0.6, 'Сливки 11%, подогретые паром', NULL, 168, 3.6, 15.4, 5.3, 140, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_raf_caramel', 'item_raf_salted_caramel', 'layer_raf_caramel', 'CYLINDER', 2, 0.9, 1.4, 0.14, 0.85, '[1.3,0,0]'::jsonb, '#b06d1f', 0.92, 0.35, 'Карамельный соус', 'С ванилью и морской солью', 78, 0, 0, 18, 25, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_raf_salt', 'item_raf_salted_caramel', 'layer_raf_salt', 'CYLINDER', 3, 1.04, 2, 0.05, 0.8, '[1.3,0,0]'::jsonb, '#f0f0e8', 1, 1, 'Морская соль', NULL, 0, 0, 0, 0, 1, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_raf_extra_shot', 'item_raf_salted_caramel', 'layer_raf_extra_shot', 'CYLINDER', 4, 1.05, 2.5, 0.12, 0.7, '[1.3,0,0]'::jsonb, '#2c1a0d', 1, 0.5, 'Доп. шот эспрессо', NULL, 4, 0, 0, 0.6, 20, false, false, true, 2);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_matcha_strawberry', 'cat_signature', 'matcha-strawberry', 'Матча Клубника', 'Церемониальная матча, холодное молоко и клубничное пюре собственного приготовления.', 8.9, 0, 0, 6, true, true, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#f2f7e8', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_matcha_puree', 'item_matcha_strawberry', 'layer_matcha_puree', 'CYLINDER', 0, 0, 0, 0.3, 0.9, '[1.3,0,0]'::jsonb, '#e14d6b', 0.88, 0.2, 'Клубничное пюре', NULL, 62, 0, 0, 14, 60, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_matcha_ice', 'item_matcha_strawberry', 'layer_matcha_ice', 'BOX', 1, 0.3, 0.7, 0.22, 0.7, '[1.3,0,0]'::jsonb, '#dceef5', 0.45, 0.1, 'Лёд', NULL, 0, 0, 0, 0, 50, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_matcha_milk', 'item_matcha_strawberry', 'layer_matcha_milk', 'CYLINDER', 2, 0.5, 1.4, 0.45, 0.95, '[1.3,0,0]'::jsonb, '#f6f1e4', 1, 0.55, 'Молоко холодное', NULL, 96, 4.8, 5.2, 7.6, 160, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_matcha_shot', 'item_matcha_strawberry', 'layer_matcha_shot', 'CYLINDER', 3, 0.95, 2.1, 0.3, 0.88, '[1.3,0,0]'::jsonb, '#7fb069', 0.95, 0.35, 'Шот церемониальной матчи', 'Взбивается тясэном на 80°C', 12, 1.1, 0, 1.8, 60, true, false, false, 0);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_cheesecake_berry', 'cat_desserts', 'cheesecake-berry', 'Чизкейк «Ягодный слой»', 'Песочная основа, крем-чиз и ягодный соус — слои видно из космоса. Украшаем свежими ягодами.', 9.2, 0, 0, 3, true, false, NULL, NULL, '{"position":[0,1.4,4.2],"target":[0,0.6,0],"fov":40}'::jsonb, 1, '#ffffff', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cheesecake_base', 'item_cheesecake_berry', 'layer_cheesecake_base', 'BOX', 0, 0, 0, 0.24, 1, '[1.3,0,0]'::jsonb, '#b98a4e', 1, 0.95, 'Песочная основа', NULL, 190, 2.4, 9, 24, 40, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cheesecake_cream', 'item_cheesecake_berry', 'layer_cheesecake_cream', 'BOX', 1, 0.24, 0.7, 0.5, 1, '[1.3,0,0]'::jsonb, '#f6eedd', 1, 0.7, 'Крем-чиз', NULL, 285, 5.4, 25, 9, 90, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cheesecake_sauce', 'item_cheesecake_berry', 'layer_cheesecake_sauce', 'BOX', 2, 0.74, 1.4, 0.14, 0.96, '[1.3,0,0]'::jsonb, '#8e2f4a', 0.95, 0.4, 'Ягодный соус', NULL, 32, 0, 0, 7.6, 25, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cheesecake_berries', 'item_cheesecake_berry', 'layer_cheesecake_berries', 'SPHERE', 3, 0.88, 2, 0.16, 0.6, '[1.3,0,0]'::jsonb, '#c23a5a', 1, 0.55, 'Свежие ягоды', NULL, 12, 0, 0, 2.4, 25, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cheesecake_extra_berries', 'item_cheesecake_berry', 'layer_cheesecake_extra_berries', 'CYLINDER', 4, 0.92, 2.5, 0.1, 0.55, '[1.3,0,0]'::jsonb, '#a6274a', 1, 0.5, 'Двойная порция ягод', NULL, 10, 0, 0, 2, 20, false, false, true, 1.8);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_tiramisu_raspberry', 'cat_desserts', 'tiramisu-raspberry', 'Тирамису Малина', 'Савоярди, пропитанный эспрессо, крем маскарпоне и малиновое желе с свежими ягодами.', 9.5, 0, 0, 3, true, false, NULL, NULL, '{"position":[0,1.4,4.2],"target":[0,0.6,0],"fov":40}'::jsonb, 1, '#ffffff', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_tiramisu_savoiardi', 'item_tiramisu_raspberry', 'layer_tiramisu_savoiardi', 'BOX', 0, 0, 0, 0.3, 0.95, '[1.3,0,0]'::jsonb, '#d9b98a', 1, 0.85, 'Савоярди в эспрессо', NULL, 140, 2.6, 1.8, 28, 35, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_tiramisu_cream', 'item_tiramisu_raspberry', 'layer_tiramisu_cream', 'BOX', 1, 0.3, 0.8, 0.4, 0.95, '[1.3,0,0]'::jsonb, '#fdf3e3', 1, 0.6, 'Крем маскарпоне', NULL, 210, 3.4, 18, 9, 70, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_tiramisu_jelly', 'item_tiramisu_raspberry', 'layer_tiramisu_jelly', 'BOX', 2, 0.7, 1.6, 0.18, 0.95, '[1.3,0,0]'::jsonb, '#c2185b', 0.82, 0.15, 'Малиновое желе', NULL, 55, 0, 0, 12.5, 30, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_tiramisu_berries', 'item_tiramisu_raspberry', 'layer_tiramisu_berries', 'SPHERE', 3, 0.9, 2.3, 0.16, 0.5, '[1.3,0,0]'::jsonb, '#ad1457', 1, 0.5, 'Свежая малина', NULL, 18, 0, 0, 4, 20, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_tiramisu_pistachio', 'item_tiramisu_raspberry', 'layer_tiramisu_pistachio', 'BOX', 4, 1.06, 2.9, 0.05, 0.9, '[1.3,0,0]'::jsonb, '#a4b787', 1, 0.9, 'Фисташковая крошка', NULL, 45, 1.6, 3.7, 1.8, 8, false, false, true, 1.2);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_croissant_almond', 'cat_bakery', 'croissant-almond', 'Миндальный круассан', 'Слоёное тесто на сливочном масле, крем франжипан и лепестки миндаля. Подаём тёплым.', 5.2, 0, 0, 4, true, false, NULL, NULL, '{"position":[0,1.2,4],"target":[0,0.3,0],"fov":40}'::jsonb, 1, '#ffffff', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_croissant_pastry', 'item_croissant_almond', 'layer_croissant_pastry', 'TORUS', 0, 0, 0, 0.5, 1, '[1.3,0,0]'::jsonb, '#d99a4e', 1, 0.7, 'Слоёное тесто', NULL, 260, 5, 14, 28, 75, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_croissant_frangipane', 'item_croissant_almond', 'layer_croissant_frangipane', 'TORUS', 1, 0.25, 0.8, 0.22, 0.8, '[1.3,0,0]'::jsonb, '#f2d8a7', 1, 0.6, 'Крем франжипан', NULL, 120, 2.2, 8, 10, 30, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_croissant_flakes', 'item_croissant_almond', 'layer_croissant_flakes', 'CYLINDER', 2, 0.5, 1.5, 0.06, 0.85, '[1.3,0,0]'::jsonb, '#f7e8c8', 1, 0.9, 'Лепестки миндаля', NULL, 60, 2, 5, 2, 10, true, true, false, 0);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_caramel_macchiato', 'cat_coffee', 'iced-caramel-macchiato', 'Айс Карамельный Макиато', 'Слоистый холодный напиток с домашней солёной карамелью, охлаждённым молоком и двойным шотом насыщенного эспрессо.', 8.5, 0, 0, 5, true, true, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#ffffff', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cm_caramel_syrup', 'item_caramel_macchiato', 'layer_cm_caramel_syrup', 'CYLINDER', 0, 0.08, 0, 0.14, 0.82, '[1.3,0,0]'::jsonb, '#c67d30', 0.9, 0.2, 'Сироп солёная карамель', NULL, 65, 0, 0.5, 15.5, 25, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cm_ice', 'item_caramel_macchiato', 'layer_cm_ice', 'BOX', 1, 0.28, 0.6, 0.25, 0.78, '[1.3,0,0]'::jsonb, '#e6f4f8', 0.55, 0.1, 'Кубики льда', NULL, 0, 0, 0, 0, 90, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cm_milk', 'item_caramel_macchiato', 'layer_cm_milk', 'CYLINDER', 2, 0.6, 1.25, 0.38, 0.86, '[1.3,0,0]'::jsonb, '#fdfbf7', 0.98, 0.35, 'Охлаждённое молоко 3.2%', NULL, 90, 4.5, 4.8, 7, 150, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cm_espresso', 'item_caramel_macchiato', 'layer_cm_espresso', 'CYLINDER', 3, 0.88, 1.9, 0.18, 0.88, '[1.3,0,0]'::jsonb, '#3b2213', 0.96, 0.3, 'Двойной эспрессо (Бразилия Серрадо)', NULL, 10, 0.6, 0.2, 1.4, 60, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cm_whipped_cream', 'item_caramel_macchiato', 'layer_cm_whipped_cream', 'SPHERE', 4, 1.05, 2.5, 0.22, 0.8, '[1.3,0,0]'::jsonb, '#fffdf8', 1, 0.6, 'Шапка взбитых сливок с карамелью', NULL, 85, 0.8, 7.5, 3.5, 35, false, false, true, 1.8);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_pistachio_raf', 'cat_coffee', 'pistachio-raspberry-raf', 'Фисташковый Раф с малиной', 'Сливочный десертный кофе, взбитый с натуральной иранской фисташковой пастой, сливками и хрустящей сублимированной малиной.', 9.2, 0, 0, 5, true, true, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#ffffff', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_raf_pistachio_paste', 'item_pistachio_raf', 'layer_raf_pistachio_paste', 'CYLINDER', 0, 0.07, 0, 0.12, 0.8, '[1.3,0,0]'::jsonb, '#87a96b', 1, 0.65, 'Натуральная паста из фисташки', NULL, 115, 4.2, 9.5, 3.8, 20, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_praf_espresso', 'item_pistachio_raf', 'layer_praf_espresso', 'CYLINDER', 1, 0.22, 0.55, 0.16, 0.84, '[1.3,0,0]'::jsonb, '#442817', 0.98, 0.3, 'Шот эспрессо', NULL, 6, 0.3, 0.1, 0.8, 35, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_raf_cream_base', 'item_pistachio_raf', 'layer_raf_cream_base', 'CYLINDER', 2, 0.58, 1.2, 0.5, 0.88, '[1.3,0,0]'::jsonb, '#e6edd8', 0.99, 0.45, 'Взбитые сливки 10% с ванилью', NULL, 210, 5.4, 18, 7.2, 180, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_raf_raspberry_crunch', 'item_pistachio_raf', 'layer_raf_raspberry_crunch', 'SPHERE', 3, 0.9, 1.95, 0.1, 0.65, '[1.3,0,0]'::jsonb, '#d12c56', 1, 0.75, 'Сублимированная малина и дроблёная фисташка', NULL, 28, 0.9, 1.2, 3.4, 8, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_praf_extra_shot', 'item_pistachio_raf', 'layer_praf_extra_shot', 'CYLINDER', 4, 0.98, 2.45, 0.12, 0.82, '[1.3,0,0]'::jsonb, '#2e1a0f', 0.95, 0.3, 'Дополнительный шот эспрессо', NULL, 6, 0.3, 0.1, 0.8, 35, false, false, true, 2);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_strawberry_matcha', 'cat_tea_matcha', 'iced-strawberry-matcha', 'Клубничный Айс Матча Латте', 'Трёхслойный освежающий напиток на кокосовом молоке с густым пюре из садовой клубники и церемониальной японской матчей Удзи.', 9, 0, 0, 5, true, true, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#ffffff', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_sm_strawberry_puree', 'item_strawberry_matcha', 'layer_sm_strawberry_puree', 'CYLINDER', 0, 0.12, 0, 0.22, 0.82, '[1.3,0,0]'::jsonb, '#d9384a', 0.92, 0.4, 'Домашнее клубничное пюре', NULL, 52, 0.4, 0.1, 12.5, 50, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_sm_coconut_milk', 'item_strawberry_matcha', 'layer_sm_coconut_milk', 'CYLINDER', 1, 0.48, 0.75, 0.42, 0.86, '[1.3,0,0]'::jsonb, '#f9f6f0', 0.95, 0.3, 'Кокосовое молоко Barista', NULL, 84, 1.2, 6.4, 5.2, 160, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_sm_matcha_shot', 'item_strawberry_matcha', 'layer_sm_matcha_shot', 'CYLINDER', 2, 0.82, 1.5, 0.22, 0.88, '[1.3,0,0]'::jsonb, '#5c8d36', 0.96, 0.45, 'Взбитый шот церемониальной матчи', NULL, 18, 1.5, 0.2, 2.5, 60, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_sm_boba_pearls', 'item_strawberry_matcha', 'layer_sm_boba_pearls', 'SPHERE', 3, 0.96, 2.2, 0.15, 0.7, '[1.3,0,0]'::jsonb, '#24160e', 0.9, 0.15, 'Шарики тапиоки в тростниковом сиропе', NULL, 95, 0.1, 0, 23, 45, false, false, true, 2.2);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_ny_cheesecake', 'cat_desserts', 'berry-cheesecake', 'Чизкейк с лесными ягодами', 'Классический выпечной чизкейк из сливочного сыра Филадельфия на рассыпчатом песочном корже с ягодным конфи и свежей голубикой и малиной.', 10.5, 0, 0, 5, true, true, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#ffffff', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_ny_crust', 'item_ny_cheesecake', 'layer_ny_crust', 'CYLINDER', 0, 0.08, 0, 0.14, 0.92, '[1.3,0,0]'::jsonb, '#b88248', 1, 0.85, 'Песочный крамбл с миндалём', NULL, 145, 2.4, 7.8, 16.5, 35, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_ny_cream', 'item_ny_cheesecake', 'layer_ny_cream', 'CYLINDER', 1, 0.42, 0.7, 0.48, 0.9, '[1.3,0,0]'::jsonb, '#f7eed7', 1, 0.5, 'Сырный мусс Филадельфия с бурбонской ванилью', NULL, 320, 6.8, 24.5, 18, 110, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_ny_compote', 'item_ny_cheesecake', 'layer_ny_compote', 'CYLINDER', 2, 0.72, 1.4, 0.12, 0.86, '[1.3,0,0]'::jsonb, '#8e2f4a', 0.95, 0.4, 'Ягодный конфитюр (ежевика-малина)', NULL, 32, 0.2, 0.1, 7.6, 25, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_ny_berries', 'item_ny_cheesecake', 'layer_ny_berries', 'SPHERE', 3, 0.88, 2, 0.16, 0.6, '[1.3,0,0]'::jsonb, '#c23a5a', 1, 0.55, 'Свежие ягоды', NULL, 12, 0.2, 0.1, 2.4, 25, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_ny_extra_berries', 'item_ny_cheesecake', 'layer_ny_extra_berries', 'SPHERE', 4, 0.92, 2.5, 0.1, 0.55, '[1.3,0,0]'::jsonb, '#a6274a', 1, 0.5, 'Двойная порция ягод', NULL, 10, 0.2, 0.1, 2, 20, false, false, true, 1.8);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_tiramisu_cup', 'cat_desserts', 'classic-tiramisu', 'Тирамису с маскарпоне и Амаретто', 'Нежный итальянский десерт из печенья савоярди, пропитанного крепким эспрессо, с воздушным кремом маскарпоне и пудрой бельгийского какао.', 9.8, 0, 0, 5, true, false, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#ffffff', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_tc_savoiardi', 'item_tiramisu_cup', 'layer_tc_savoiardi', 'BOX', 0, 0.14, 0, 0.24, 0.85, '[1.3,0,0]'::jsonb, '#6e472b', 1, 0.75, 'Савоярди с пропиткой эспрессо', NULL, 140, 3.2, 1.8, 27.5, 45, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_tc_mascarpone', 'item_tiramisu_cup', 'layer_tc_mascarpone', 'CYLINDER', 1, 0.52, 0.8, 0.46, 0.88, '[1.3,0,0]'::jsonb, '#faf3e0', 1, 0.4, 'Крем на основе сыра Маскарпоне', NULL, 295, 4.8, 26, 10.5, 90, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_tc_cocoa', 'item_tiramisu_cup', 'layer_tc_cocoa', 'CYLINDER', 2, 0.8, 1.55, 0.06, 0.88, '[1.3,0,0]'::jsonb, '#3d2314', 1, 0.95, 'Вуаль из алкализованного какао 22%', NULL, 22, 1.4, 1.2, 1.1, 6, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_tc_pecan', 'item_tiramisu_cup', 'layer_tc_pecan', 'SPHERE', 3, 0.9, 2.15, 0.12, 0.55, '[1.3,0,0]'::jsonb, '#8c5227', 1, 0.6, 'Карамелизированный орех пекан', NULL, 85, 1.1, 8.2, 2.4, 12, false, false, true, 2.1);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_salmon_croissant', 'cat_breakfast', 'salmon-avocado-croissant', 'Круассан с лососем и гуакамоле', 'Сливочный французский круассан на масле 82.5% с творожным муссом, гуакамоле из спелого авокадо Хасс и слабосолёной форелью.', 14.5, 0, 0, 5, true, true, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#ffffff', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_croissant_bottom', 'item_salmon_croissant', 'layer_croissant_bottom', 'CYLINDER', 0, 0.1, 0, 0.18, 0.95, '[1.3,0,0]'::jsonb, '#d69847', 1, 0.7, 'Нижняя половинка масляного круассана', NULL, 145, 3.1, 8.2, 14.8, 35, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_croissant_cream_cheese', 'item_salmon_croissant', 'layer_croissant_cream_cheese', 'CYLINDER', 1, 0.25, 0.55, 0.12, 0.85, '[1.3,0,0]'::jsonb, '#f7f6f0', 1, 0.45, 'Взбитый творожный крем-чиз с зеленью', NULL, 78, 2.2, 7.1, 1.2, 30, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_croissant_guacamole', 'item_salmon_croissant', 'layer_croissant_guacamole', 'CYLINDER', 2, 0.4, 1.1, 0.15, 0.82, '[1.3,0,0]'::jsonb, '#78a146', 1, 0.65, 'Гуакамоле из авокадо Хасс с соком лайма', NULL, 72, 0.9, 6.6, 3.4, 45, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_croissant_salmon', 'item_salmon_croissant', 'layer_croissant_salmon', 'CYLINDER', 3, 0.56, 1.65, 0.14, 0.86, '[1.3,0,0]'::jsonb, '#f2795c', 0.98, 0.35, 'Слабосолёное филе лосося', NULL, 98, 10.5, 6.2, 0, 50, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_croissant_poached_egg', 'item_salmon_croissant', 'layer_croissant_poached_egg', 'SPHERE', 4, 0.72, 2.2, 0.18, 0.55, '[1.3,0,0]'::jsonb, '#f9c74f', 1, 0.3, 'Фермерское яйцо пашот', NULL, 75, 6.3, 5.3, 0.6, 50, false, false, true, 2.5);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_croissant_top', 'item_salmon_croissant', 'layer_croissant_top', 'SPHERE', 5, 0.9, 2.8, 0.22, 0.92, '[1.3,0,0]'::jsonb, '#c9822b', 1, 0.65, 'Хрустящая крышечка круассана с кунжутом', NULL, 145, 3.1, 8.2, 14.8, 35, true, false, false, 0);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_cappuccino_classic', 'cat_coffee', 'cappuccino-classic', 'Капучино Классический', 'Эспрессо, молоко 3.2% и плотная микропена 1:1:1 — классика итальянской чашки.', 6.2, 0, 0, 4, true, true, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#f0e4d4', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cap_espresso', 'item_cappuccino_classic', 'layer_cap_espresso', 'CYLINDER', 0, 0, 0, 0.32, 1, '[1.3,0,0]'::jsonb, '#3a2417', 1, 0.4, 'Эспрессо (Бразилия Серрадо)', NULL, 6, 0, 0, 1.1, 30, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cap_milk', 'item_cappuccino_classic', 'layer_cap_milk', 'CYLINDER', 1, 0.32, 0.65, 0.4, 1, '[1.3,0,0]'::jsonb, '#f3e9d2', 1, 0.4, 'Молоко 3.2%', NULL, 78, 4, 4.2, 6.1, 120, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cap_foam', 'item_cappuccino_classic', 'layer_cap_foam', 'CYLINDER', 2, 0.75, 1.35, 0.35, 1, '[1.3,0,0]'::jsonb, '#fffaf0', 1, 0.92, 'Микропена', NULL, 28, 1.5, 1.5, 2.2, 40, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_cap_cocoa', 'item_cappuccino_classic', 'layer_cap_cocoa', 'CYLINDER', 3, 1.05, 2.1, 0.04, 1, '[1.3,0,0]'::jsonb, '#4a2c1a', 1, 0.4, 'Какао-пыль', NULL, 8, 0, 0, 1.4, 2, false, false, true, 0.4);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_flat_white_oat', 'cat_coffee', 'flat-white-oat', 'Флэт Уайт на овсяном', 'Двойной ристретто под бархатной овсяной микропеной — мягкий ореховый профиль.', 7.4, 0, 0, 4, true, false, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#efe6d8', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_fw_ristretto', 'item_flat_white_oat', 'layer_fw_ristretto', 'CYLINDER', 0, 0, 0.6, 0.3, 1, '[1.3,0,0]'::jsonb, '#2c1a10', 1, 0.4, 'Двойной ристретто', NULL, 10, 0, 0, 1.6, 40, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_fw_oat', 'item_flat_white_oat', 'layer_fw_oat', 'CYLINDER', 1, 0.3, 0.7, 0.55, 1, '[1.3,0,0]'::jsonb, '#f6edd8', 1, 0.4, 'Овсяное молоко barista', NULL, 96, 1.8, 3.2, 14.5, 180, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_fw_foam', 'item_flat_white_oat', 'layer_fw_foam', 'CYLINDER', 2, 0.88, 1.4, 0.14, 1, '[1.3,0,0]'::jsonb, '#fff8ea', 1, 0.4, 'Тонкая микропена', NULL, 18, 0, 0, 2.8, 20, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_fw_honey', 'item_flat_white_oat', 'layer_fw_honey', 'CYLINDER', 3, 1, 2, 0.06, 1, '[1.3,0,0]'::jsonb, '#d4a017', 1, 0.4, 'Мёд цветочный', NULL, 42, 0, 0, 11, 12, false, false, true, 1.2);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_mocha_hazelnut', 'cat_signature', 'mocha-hazelnut', 'Мокка «Фундук»', 'Эспрессо, тёмный какао-ганаш, молоко и фундучный сироп — десерт в чашке.', 8.6, 0, 0, 5, true, true, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#e8d5c4', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_mocha_espresso', 'item_mocha_hazelnut', 'layer_mocha_espresso', 'CYLINDER', 0, 0, 0.6, 0.28, 1, '[1.3,0,0]'::jsonb, '#3a2417', 1, 0.4, 'Эспрессо', NULL, 6, 0, 0, 0, 30, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_mocha_ganache', 'item_mocha_hazelnut', 'layer_mocha_ganache', 'CYLINDER', 1, 0.28, 0.55, 0.18, 1, '[1.3,0,0]'::jsonb, '#4a2a18', 1, 0.4, 'Какао-ганаш 70%', NULL, 95, 0, 7.2, 8.4, 35, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_mocha_milk', 'item_mocha_hazelnut', 'layer_mocha_milk', 'CYLINDER', 2, 0.5, 1.1, 0.4, 1, '[1.3,0,0]'::jsonb, '#f3e9d2', 1, 0.4, 'Молоко 3.2%', NULL, 90, 4.6, 4.8, 7, 150, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_mocha_hazelnut', 'item_mocha_hazelnut', 'layer_mocha_hazelnut', 'CYLINDER', 3, 0.95, 1.8, 0.08, 1, '[1.3,0,0]'::jsonb, '#a0672c', 1, 0.4, 'Сироп фундук', NULL, 72, 0, 0, 17.5, 15, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_mocha_cream', 'item_mocha_hazelnut', 'layer_mocha_cream', 'CYLINDER', 4, 1.1, 2.4, 0.2, 1, '[1.3,0,0]'::jsonb, '#fffaf2', 1, 0.4, 'Взбитые сливки', NULL, 68, 0, 6.5, 1.2, 25, false, false, true, 1.5);
INSERT INTO "MenuItem" ("id", "categoryId", "slug", "name", "description", "basePrice", "baseCalories", "baseWeightGrams", "prepTimeMinutes", "isAvailable", "isFeatured", "modelUrl", "previewImageUrl", "cameraPreset", "scale3D", "ambientColorHex", "updatedAt") VALUES ('item_lemon_cheesecake', 'cat_desserts', 'lemon-cheesecake', 'Чизкейк «Лимонный курд»', 'Песочная база, крем-чиз и яркий лимонный курд с цедрой — свежий акцент к кофе.', 9.4, 0, 0, 2, true, false, NULL, NULL, '{"position":[0,1.8,4.5],"target":[0,0.5,0],"fov":42}'::jsonb, 1, '#f5edd8', NOW());
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_lemon_base', 'item_lemon_cheesecake', 'layer_lemon_base', 'CYLINDER', 0, 0, 0.6, 0.18, 1, '[1.3,0,0]'::jsonb, '#c9a06a', 1, 0.4, 'Песочная база', NULL, 145, 0, 8.2, 15.5, 40, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_lemon_cream', 'item_lemon_cheesecake', 'layer_lemon_cream', 'CYLINDER', 1, 0.22, 0.7, 0.42, 1, '[1.3,0,0]'::jsonb, '#f7f2e8', 1, 0.4, 'Крем-чиз', NULL, 210, 4.5, 18, 8, 90, true, false, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_lemon_curd', 'item_lemon_cheesecake', 'layer_lemon_curd', 'CYLINDER', 2, 0.7, 1.35, 0.16, 1, '[1.3,0,0]'::jsonb, '#f0d35a', 1, 0.4, 'Лимонный курд', NULL, 88, 0, 4.2, 12, 35, true, true, false, 0);
INSERT INTO "MenuItemLayer" ("id", "menuItemId", "meshName", "primitiveType", "layerOrder", "basePositionY", "explodeOffsetY", "heightScale", "radiusScale", "labelPosition", "colorHex", "opacity", "roughness", "title", "description", "calories", "proteins", "fats", "carbs", "weightGrams", "isDefault", "isRemovable", "isOptionalAdd", "priceModifier") VALUES ('layer_lemon_zest', 'item_lemon_cheesecake', 'layer_lemon_zest', 'CYLINDER', 3, 0.9, 2, 0.05, 1, '[1.3,0,0]'::jsonb, '#d4b84a', 1, 0.4, 'Цедра лимона', NULL, 4, 0, 0, 1, 2, false, false, true, 0.6);
INSERT INTO "CafeTable" ("id", "number", "title", "seats", "zone", "hasPowerOutlet", "meshName", "position3D", "rotationY") VALUES ('cafe-table-1', 1, 'Столик №1 у панорамного окна', 2, 'WINDOW', true, 'Table_Mesh_01', '[-4.5,0,-3]'::jsonb, 0);
INSERT INTO "CafeTable" ("id", "number", "title", "seats", "zone", "hasPowerOutlet", "meshName", "position3D", "rotationY") VALUES ('cafe-table-2', 2, 'Столик №2 у панорамного окна', 2, 'WINDOW', true, 'Table_Mesh_02', '[-1.5,0,-3]'::jsonb, 0);
INSERT INTO "CafeTable" ("id", "number", "title", "seats", "zone", "hasPowerOutlet", "meshName", "position3D", "rotationY") VALUES ('cafe-table-3', 3, 'Столик №3 у панорамного окна', 4, 'WINDOW', false, 'Table_Mesh_03', '[1.5,0,-3]'::jsonb, 0);
INSERT INTO "CafeTable" ("id", "number", "title", "seats", "zone", "hasPowerOutlet", "meshName", "position3D", "rotationY") VALUES ('cafe-table-4', 4, 'Столик №4 у панорамного окна', 4, 'WINDOW', false, 'Table_Mesh_04', '[4.5,0,-3]'::jsonb, 0);
INSERT INTO "CafeTable" ("id", "number", "title", "seats", "zone", "hasPowerOutlet", "meshName", "position3D", "rotationY") VALUES ('cafe-table-5', 5, 'Столик №5 в центре зала', 2, 'CENTER', false, 'Table_Mesh_05', '[-3,0,0]'::jsonb, 0);
INSERT INTO "CafeTable" ("id", "number", "title", "seats", "zone", "hasPowerOutlet", "meshName", "position3D", "rotationY") VALUES ('cafe-table-6', 6, 'Столик №6 в центре зала', 4, 'CENTER', false, 'Table_Mesh_06', '[0,0,0]'::jsonb, 0);
INSERT INTO "CafeTable" ("id", "number", "title", "seats", "zone", "hasPowerOutlet", "meshName", "position3D", "rotationY") VALUES ('cafe-table-7', 7, 'Столик №7 в центре зала', 6, 'CENTER', false, 'Table_Mesh_07', '[3,0,0]'::jsonb, 0);
INSERT INTO "CafeTable" ("id", "number", "title", "seats", "zone", "hasPowerOutlet", "meshName", "position3D", "rotationY") VALUES ('cafe-table-8', 8, 'Столик №8 в тихой зоне', 2, 'QUIET', true, 'Table_Mesh_08', '[-3,0,3]'::jsonb, 0);
INSERT INTO "CafeTable" ("id", "number", "title", "seats", "zone", "hasPowerOutlet", "meshName", "position3D", "rotationY") VALUES ('cafe-table-9', 9, 'Столик №9 в тихой зоне', 2, 'QUIET', true, 'Table_Mesh_09', '[0,0,3]'::jsonb, 0);
INSERT INTO "CafeTable" ("id", "number", "title", "seats", "zone", "hasPowerOutlet", "meshName", "position3D", "rotationY") VALUES ('cafe-table-10', 10, 'Столик №10 на террасе', 4, 'TERRACE', false, 'Table_Mesh_10', '[3.5,0,3]'::jsonb, 0);
INSERT INTO "User" ("id", "email", "firstName", "role", "passwordHash", "updatedAt") VALUES ('user-admin', 'admin@tactile.local', 'Админ', 'ADMIN', '$2b$10$WlFceV2RvZza4azuYs.MZ.do18wFQ4gOxMt.52XBI9oawksOMt2ry', NOW());
INSERT INTO "User" ("id", "email", "firstName", "role", "passwordHash", "updatedAt") VALUES ('user-barista', 'barista@tactile.local', 'Бариста', 'BARISTA', '$2b$10$gVuX.ImyNPA1COmA0.2oyutLzmi6yzuodQ4r.8b0dugrM/tBLnCiS', NOW());
COMMIT;