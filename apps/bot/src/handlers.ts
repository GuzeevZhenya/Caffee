import { botProfileSchema, checkDeliveryPoint, guestPhoneSchema, normalizePhone, parseOrderRef } from "@repo/shared";
import { randomInt } from "node:crypto";
import { fetchOrderStatus, saveBotProfile, triggerCooking } from "./cafe-api";
import type { CafeContext } from "./context";
import {
  BTN_CART,
  BTN_MENU,
  BTN_STATUS,
  BTN_ZONE,
  cookKeyboard,
  deliveryText,
  locationKeyboard,
  mainKeyboard,
  parseCookCallback,
  phoneAskText,
  phoneCodeMessageText,
  phoneCodePromptText,
  phoneConfirmKeyboard,
  phoneKeyboard,
  statusText,
  welcomeText,
} from "./format";
import {
  addToCart,
  isCancelText,
  placeCartOrder,
  showCart,
  showCategories,
  showCategory,
  showItem,
} from "./shop";

function telegramIdOf(ctx: CafeContext): string | null {
  const id = ctx.from?.id;
  return id ? String(id) : null;
}

function restoreIdle(ctx: CafeContext): void {
  ctx.session.step = "idle";
  ctx.session.pendingPhone = undefined;
  ctx.session.phoneCode = undefined;
}

async function replyOrderStatus(ctx: CafeContext, raw: string): Promise<void> {
  const ref = parseOrderRef(raw);
  if (!ref) {
    await ctx.reply("Пришлите номер заказа, например 1045.", { reply_markup: mainKeyboard() });
    return;
  }

  try {
    const order = await fetchOrderStatus(ref);
    if (!order) {
      await ctx.reply("Заказ не найден. Проверьте номер.", { reply_markup: mainKeyboard() });
      return;
    }
    restoreIdle(ctx);
    const extra = order.status === "COOKING_HOLD" ? cookKeyboard(order.orderId) : undefined;
    await ctx.reply(statusText(order), extra ? { reply_markup: extra } : { reply_markup: mainKeyboard() });
  } catch {
    await ctx.reply("Не удалось получить статус. Попробуйте через минуту.", {
      reply_markup: mainKeyboard(),
    });
  }
}

async function startCheckout(ctx: CafeContext): Promise<void> {
  if (ctx.session.cart.length === 0) {
    await ctx.reply("Сначала добавьте блюдо из меню.", { reply_markup: mainKeyboard() });
    return;
  }
  ctx.session.step = "await_phone";
  ctx.session.pendingPhone = undefined;
  ctx.session.phoneCode = undefined;
  await ctx.reply(phoneAskText(), { reply_markup: phoneKeyboard() });
}

async function sendPhoneCode(ctx: CafeContext, phone: string): Promise<void> {
  const code = String(randomInt(1000, 10000));
  ctx.session.pendingPhone = phone;
  ctx.session.phoneCode = code;
  ctx.session.step = "await_phone_code";
  await ctx.reply(phoneCodePromptText(phone), { reply_markup: phoneConfirmKeyboard() });
  await ctx.reply(phoneCodeMessageText(code), { reply_markup: mainKeyboard() });
}

async function acceptTypedPhone(ctx: CafeContext, raw: string): Promise<boolean> {
  const normalized = normalizePhone(raw);
  const parsed = guestPhoneSchema.safeParse(normalized);
  if (!parsed.success) return false;
  await sendPhoneCode(ctx, parsed.data);
  return true;
}

async function persistContact(ctx: CafeContext): Promise<boolean> {
  const contact = ctx.message?.contact;
  if (!contact?.phone_number) return false;
  if (ctx.session.step !== "await_phone" && ctx.session.step !== "await_phone_code") {
    await ctx.reply("Телефон нужен только при оформлении заказа. Откройте корзину и нажмите «Оформить заказ».", {
      reply_markup: mainKeyboard(),
    });
    return true;
  }
  if (contact.user_id && contact.user_id !== ctx.from?.id) {
    await ctx.reply("Нужен ваш контакт, не чужой.", { reply_markup: phoneKeyboard() });
    return true;
  }
  const phone = normalizePhone(contact.phone_number);
  const parsed = guestPhoneSchema.safeParse(phone);
  if (!parsed.success) {
    await ctx.reply("Не получилось прочитать телефон. Напишите номер вручную.", {
      reply_markup: phoneKeyboard(),
    });
    return true;
  }
  await sendPhoneCode(ctx, parsed.data);
  return true;
}

async function confirmPhoneAndOrder(ctx: CafeContext): Promise<void> {
  const phone = ctx.session.pendingPhone;
  const telegramId = telegramIdOf(ctx);
  if (!phone || !telegramId) {
    await ctx.reply("Не удалось подтвердить номер. Оформите заказ ещё раз.", {
      reply_markup: mainKeyboard(),
    });
    restoreIdle(ctx);
    return;
  }
  const firstName = (ctx.from?.first_name || "Гость").trim();
  const profile = botProfileSchema.safeParse({
    telegramId,
    firstName,
    phone,
    username: ctx.from?.username,
  });
  if (profile.success) {
    await saveBotProfile(profile.data);
  }
  const ok = await placeCartOrder(ctx);
  if (!ok) {
    ctx.session.step = "idle";
  }
}

async function persistLocation(ctx: CafeContext): Promise<boolean> {
  const location = ctx.message?.location;
  if (!location) return false;
  const result = checkDeliveryPoint({ lat: location.latitude, lng: location.longitude });
  restoreIdle(ctx);
  await ctx.reply(deliveryText(result), { reply_markup: mainKeyboard() });
  return true;
}

export async function onStart(ctx: CafeContext): Promise<void> {
  restoreIdle(ctx);
  await ctx.reply(welcomeText(), { reply_markup: mainKeyboard() });
}

export async function onMenu(ctx: CafeContext): Promise<void> {
  ctx.session.step = "idle";
  await showCategories(ctx);
}

export async function onZone(ctx: CafeContext): Promise<void> {
  ctx.session.step = "await_location";
  await ctx.reply("Пришлите геолокацию — проверю зону доставки.", {
    reply_markup: locationKeyboard(),
  });
}

export async function onStatus(ctx: CafeContext): Promise<void> {
  const arg = ctx.match;
  const raw = typeof arg === "string" ? arg.trim() : "";
  if (raw) {
    await replyOrderStatus(ctx, raw);
    return;
  }
  ctx.session.step = "await_order";
  await ctx.reply("Какой номер заказа? Например 1045.", { reply_markup: mainKeyboard() });
}

export async function onMessage(ctx: CafeContext): Promise<void> {
  if (await persistContact(ctx)) return;
  if (await persistLocation(ctx)) return;

  const text = ctx.message?.text?.trim();
  if (!text || text.startsWith("/")) return;

  if (isCancelText(text)) {
    restoreIdle(ctx);
    await ctx.reply("Отменил. Меню и корзина на месте.", { reply_markup: mainKeyboard() });
    return;
  }

  if (text === BTN_MENU) {
    await onMenu(ctx);
    return;
  }
  if (text === BTN_CART) {
    await showCart(ctx);
    return;
  }
  if (text === BTN_ZONE) {
    await onZone(ctx);
    return;
  }
  if (text === BTN_STATUS) {
    await onStatus(ctx);
    return;
  }

  if (ctx.session.step === "await_phone_code") {
    if (text === ctx.session.phoneCode) {
      await confirmPhoneAndOrder(ctx);
      return;
    }
    if (await acceptTypedPhone(ctx, text)) return;
    await ctx.reply("Код не совпал. Введите код из сообщения или другой номер.", {
      reply_markup: phoneConfirmKeyboard(),
    });
    return;
  }

  if (ctx.session.step === "await_phone") {
    if (await acceptTypedPhone(ctx, text)) return;
    await ctx.reply("Не похоже на телефон. Напишите, например +375291061403, или нажмите кнопку.", {
      reply_markup: phoneKeyboard(),
    });
    return;
  }

  if (ctx.session.step === "await_order") {
    await replyOrderStatus(ctx, text);
  }
}

export async function onCallback(ctx: CafeContext): Promise<void> {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const cook = parseCookCallback(data);
  if (cook) {
    const order = await triggerCooking({ orderId: cook.orderId, startNow: cook.startNow });
    if (!order) {
      await ctx.answerCallbackQuery({ text: "Триггер недоступен" });
      await ctx.editMessageText("Не удалось обновить заказ. Возможно, его уже взяли в работу.");
      return;
    }
    await ctx.answerCallbackQuery({ text: cook.startNow ? "Передали бариста" : "Ждём у входа" });
    const suffix = cook.startNow
      ? " Бариста уже видит заказ."
      : " Нажмите «Готовить сейчас», когда будете у двери.";
    await ctx.editMessageText(`${statusText(order)}${suffix}`);
    return;
  }

  if (data === "m:cats" || data === "m:back") {
    await ctx.answerCallbackQuery();
    await showCategories(ctx);
    return;
  }
  if (data.startsWith("m:cat:")) {
    await ctx.answerCallbackQuery();
    await showCategory(ctx, data.slice("m:cat:".length));
    return;
  }
  if (data.startsWith("m:item:")) {
    await ctx.answerCallbackQuery();
    await showItem(ctx, data.slice("m:item:".length));
    return;
  }
  if (data.startsWith("m:add:")) {
    await addToCart(ctx, data.slice("m:add:".length));
    return;
  }
  if (data === "chk") {
    await ctx.answerCallbackQuery();
    await startCheckout(ctx);
    return;
  }
  if (data === "clr") {
    ctx.session.cart = [];
    await ctx.answerCallbackQuery({ text: "Корзина пуста" });
    await showCart(ctx);
    return;
  }
  if (data === "ph:no") {
    await ctx.answerCallbackQuery();
    ctx.session.step = "await_phone";
    ctx.session.phoneCode = undefined;
    ctx.session.pendingPhone = undefined;
    await ctx.reply(phoneAskText(), { reply_markup: phoneKeyboard() });
    return;
  }

  await ctx.answerCallbackQuery();
}
