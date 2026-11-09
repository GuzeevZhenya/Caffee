import { drinkPhotoUrl } from "@/shared/lib";
import type { MenuItem3DConfig } from "@repo/shared";
import { LayerStackSvg } from "./LayerStackSvg";

interface DrinkPhotoProps {
  item: MenuItem3DConfig;
  /** Классы обёртки (задают размер блока) */
  className?: string;
  /** Классы img (по умолчанию — вписывание без обрезки) */
  imgClassName?: string;
}

/**
 * Полномасштабное фото напитка/десерта. Если фото нет —
 * показывает SVG-раскладку слоёв по центру блока.
 */
export function DrinkPhoto({ item, className, imgClassName }: DrinkPhotoProps) {
  const photo = drinkPhotoUrl(item);
  if (photo) {
    return (
      <img
        src={photo}
        alt={item.name}
        loading="lazy"
        className={imgClassName ?? "size-full object-contain"}
      />
    );
  }
  return (
    <span className={`grid place-items-center ${className ?? ""}`}>
      <span className="scale-[2]">
        <LayerStackSvg item={item} />
      </span>
    </span>
  );
}
