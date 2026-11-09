import type { ReactNode } from "react";
import type { MenuItem3DConfig } from "@repo/shared";

/** Пропсы карточки блюда в сетке «Популярные напитки» */
export interface PopularCardProps {
  item: MenuItem3DConfig;
}

/** Преимущество кофейни (иконка + заголовок + текст) */
export interface Feature {
  title: string;
  text: string;
  icon: ReactNode;
}

/** Отзыв гостя */
export interface Quote {
  text: string;
  cite: string;
}
