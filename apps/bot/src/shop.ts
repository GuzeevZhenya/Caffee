import {
  calculateItemTotals,
  getDefaultActiveLayerIds,
  type MenuItem3DConfig,
  type MenuResponse,
} from "@repo/shared";
import { createTakeawayOrder, fetchMenu } from "./cafe-api";
import type { CafeContext, CartLine } from "./context";
import {
  BTN_CANCEL,
  cartKeyboard,
  cartText,
  categoriesKeyboard,
  itemKeyboard,
  itemText,
  itemsKeyboard,
  mainKeyboard,
  orderPlacedText,
} from "./format";

let menuCache: { at: number; data: MenuResponse } | null = null;
const MENU_TTL_MS = 60_000;

export async function loadMenu(): Promise<MenuResponse | null> {
  if (menuCache && Date.now() - menuCache.at < MENU_TTL_MS) {
    return menuCache.data;
  }
  const data = await fetchMenu();
  if (data) menuCache = { at: Date.now(), data };
  return data;
}

export function findItem(menu: MenuResponse, itemId: string): MenuItem3DConfig | undefined {
  return menu.items.find((item) => item.id === itemId);
}

export async function showCategories(ctx: CafeContext): Promise<void> {
  const menu = await loadMenu();
  if (!menu) {
    await ctx.reply("Меню сейчас недоступно. Попробуйте через минуту.", {
      reply_markup: mainKeyboard(),
    });
    return;
  }
  await ctx.reply("Категории:", { reply_markup: categoriesKeyboard(menu.categories) });
}

export async function showCategory(ctx: CafeContext, categoryId: string): Promise<void> {
  const menu = await loadMenu();
  if (!menu) {
    await ctx.reply("Меню сейчас недоступно.", { reply_markup: mainKeyboard() });
    return;
  }
  const items = menu.items.filter((item) => item.categoryId === categoryId);
  const title = menu.categories.find((category) => category.id === categoryId)?.name ?? "Меню";
  if (items.length === 0) {
    await ctx.reply("В этой категории пока пусто.", { reply_markup: categoriesKeyboard(menu.categories) });
    return;
  }
  await ctx.reply(title, { reply_markup: itemsKeyboard(items) });
}

export async function showItem(ctx: CafeContext, itemId: string): Promise<void> {
  const menu = await loadMenu();
  const item = menu ? findItem(menu, itemId) : undefined;
  if (!item) {
    await ctx.reply("Блюдо не найдено.", { reply_markup: mainKeyboard() });
    return;
  }
  const totals = calculateItemTotals(item, getDefaultActiveLayerIds(item));
  await ctx.reply(itemText(item, totals.unitPrice), { reply_markup: itemKeyboard(item.id) });
}

export async function addToCart(ctx: CafeContext, itemId: string): Promise<void> {
  const menu = await loadMenu();
  const item = menu ? findItem(menu, itemId) : undefined;
  if (!item) {
    await ctx.answerCallbackQuery({ text: "Блюдо недоступно" });
    return;
  }
  const activeLayerIds = getDefaultActiveLayerIds(item);
  const totals = calculateItemTotals(item, activeLayerIds);
  const existing = ctx.session.cart.find((line) => line.menuItemId === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    const line: CartLine = {
      menuItemId: item.id,
      name: item.name,
      quantity: 1,
      activeLayerIds,
      unitPrice: totals.unitPrice,
    };
    ctx.session.cart.push(line);
  }
  await ctx.answerCallbackQuery({ text: "В корзине" });
  await ctx.reply(`${item.name} добавлен.\n${cartText(ctx.session.cart)}`, {
    reply_markup: cartKeyboard(ctx.session.cart.length === 0),
  });
}

export async function showCart(ctx: CafeContext): Promise<void> {
  await ctx.reply(cartText(ctx.session.cart), {
    reply_markup: cartKeyboard(ctx.session.cart.length === 0),
  });
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

export async function placeCartOrder(ctx: CafeContext): Promise<boolean> {
  if (ctx.session.cart.length === 0) {
    await ctx.reply("Корзина пуста.", { reply_markup: mainKeyboard() });
    return false;
  }
  const created = await createTakeawayOrder({
    type: "TAKEAWAY",
    bonusSpent: 0,
    items: ctx.session.cart.map((line) => ({
      menuItemId: line.menuItemId,
      quantity: line.quantity,
      customConfiguration: {
        activeLayerIds: line.activeLayerIds,
        removedTitles: [],
        addedTitles: [],
      },
    })),
  });
  if (!created) {
    await ctx.reply("Не удалось оформить заказ. Попробуйте ещё раз.", {
      reply_markup: mainKeyboard(),
    });
    return false;
  }
  const total = created.finalTotal || cartTotal(ctx.session.cart);
  ctx.session.cart = [];
  ctx.session.step = "idle";
  ctx.session.pendingPhone = undefined;
  ctx.session.phoneCode = undefined;
  await ctx.reply(orderPlacedText(created.orderNumber, total), { reply_markup: mainKeyboard() });
  return true;
}

export function isCancelText(text: string): boolean {
  return text === BTN_CANCEL;
}
