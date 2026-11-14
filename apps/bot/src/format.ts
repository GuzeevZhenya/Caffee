import {
  FREE_DELIVERY_FROM,
  ORDER_STATUS_LABELS,
  type DeliveryCheckResult,
  type MenuCategory,
  type MenuItem3DConfig,
  type OrderStatus,
  type OrderStatusResponse,
} from "@repo/shared";
import { InlineKeyboard, Keyboard } from "grammy";
import type { CartLine } from "./context";
import { miniAppUrl } from "./webapp";

export const BTN_MENU = "Меню";
export const BTN_CART = "Корзина";
export const BTN_ZONE = "Доставка";
export const BTN_STATUS = "Статус";
export const BTN_CANCEL = "Отмена";

export function money(value: number): string {
  return `${value.toFixed(2)} BYN`;
}

export function mainKeyboard(): Keyboard {
  const keyboard = new Keyboard().text(BTN_MENU).text(BTN_CART).row().text(BTN_ZONE).text(BTN_STATUS);
  const appUrl = miniAppUrl();
  if (appUrl) {
    keyboard.row().webApp("Открыть как приложение", appUrl);
  }
  return keyboard.resized();
}

export function phoneKeyboard(): Keyboard {
  return new Keyboard().requestContact("Отправить телефон").row().text(BTN_CANCEL).resized();
}

export function locationKeyboard(): Keyboard {
  return new Keyboard().requestLocation("Отправить геолокацию").row().text(BTN_CANCEL).resized();
}

export function cookKeyboard(orderId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("Готовить сейчас", `cook:1:${orderId}`)
    .text("Я опаздываю", `cook:0:${orderId}`);
}

export function categoriesKeyboard(categories: MenuCategory[]): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  categories.forEach((category, index) => {
    keyboard.text(category.name, `m:cat:${category.id}`);
    if (index % 2 === 1) keyboard.row();
  });
  return keyboard;
}

export function itemsKeyboard(items: MenuItem3DConfig[]): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (const item of items) {
    keyboard.text(`${item.name} · ${money(item.basePrice)}`, `m:item:${item.id}`).row();
  }
  keyboard.text("← Категории", "m:cats");
  return keyboard;
}

export function itemKeyboard(itemId: string): InlineKeyboard {
  return new InlineKeyboard().text("В корзину", `m:add:${itemId}`).row().text("← К списку", "m:back");
}

export function cartKeyboard(empty: boolean): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  if (!empty) {
    keyboard.text("Оформить заказ", "chk").row().text("Очистить", "clr");
  }
  keyboard.row().text("К меню", "m:cats");
  return keyboard;
}

export function phoneConfirmKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text("Другой номер", "ph:no");
}

export function welcomeText(): string {
  return [
    "Tactile Craft Coffee & Bakery.",
    "Откройте меню как приложение — кнопка внизу чата или «Открыть как приложение».",
    "Телефон спросим только при оформлении заказа.",
  ].join("\n");
}

export function deliveryText(result: DeliveryCheckResult): string {
  if (!result.inZone) {
    return "Эта точка вне зоны доставки. Заказ из бота можно забрать в кофейне.";
  }
  return `Вы в зоне. Доставка бесплатна от ${result.freeFrom} BYN, порог — ${FREE_DELIVERY_FROM} BYN. Из бота пока оформляем самовывоз.`;
}

export function statusText(order: OrderStatusResponse): string {
  const label = ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status;
  const paid = order.isPaid ? "оплачен" : "не оплачен";
  return `Заказ #${order.orderNumber}: ${label} (${paid}).`;
}

export function reminderText(firstName: string | null, startTimeIso: string): string {
  const when = new Date(startTimeIso).toLocaleTimeString("ru-BY", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const hello = firstName ? `${firstName}, ` : "";
  return `${hello}через 15 минут бронь к ${when}. Начать готовить заказ?`;
}

export function cartText(lines: CartLine[]): string {
  if (lines.length === 0) {
    return "Корзина пуста. Откройте «Меню» и добавьте блюдо.";
  }
  const rows = lines.map(
    (line) => `• ${line.name} × ${line.quantity} — ${money(line.unitPrice * line.quantity)}`,
  );
  const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  return `Корзина\n${rows.join("\n")}\n\nИтого: ${money(total)}`;
}

export function itemText(item: MenuItem3DConfig, unitPrice: number): string {
  return `${item.name}\n${item.description}\n\n${money(unitPrice)}`;
}

export function phoneAskText(): string {
  return "Чтобы оформить заказ, нужен телефон. Нажмите «Отправить телефон» или напишите номер, например +375291061403.";
}

export function phoneCodePromptText(phone: string): string {
  return `На номер ${phone} отправили код подтверждения. Введите его из следующего сообщения — только после этого оформим заказ.`;
}

export function phoneCodeMessageText(code: string): string {
  return `Код подтверждения: ${code}`;
}

export function orderPlacedText(orderNumber: number, total: number): string {
  return `Заказ #${orderNumber} принят, ${money(total)}. Забрать в кофейне.\nСтатус: /status ${orderNumber}`;
}

export function parseCookCallback(data: string): { startNow: boolean; orderId: string } | null {
  const [kind, flag, ...rest] = data.split(":");
  if (kind !== "cook" || (flag !== "0" && flag !== "1") || rest.length === 0) return null;
  return { startNow: flag === "1", orderId: rest.join(":") };
}
