import { drinkLayerOverlays, drinkPhotoUrl } from "@/shared/lib";
import type { MenuItem3DConfig } from "@repo/shared";
import { LayerStackSvg } from "./LayerStackSvg";

interface DrinkPhotoProps {
  item: MenuItem3DConfig;
  /** Классы обёртки (задают размер блока) */
  className?: string;
  /** Классы img */
  imgClassName?: string;
  /**
   * cover — обрезает под родителя (карточки).
   * contain — показывает JPG целиком без обрезки (страница блюда).
   */
  fit?: "cover" | "contain";
  /**
   * Активные слои кастомизатора. Когда переданы — поверх базового фото
   * показываются SVG-оверлеи для топпингов.
   */
  activeLayerIds?: readonly string[];
}

/**
 * Фото напитка/десерта.
 * cover — заполняет родителя; contain — полный кадр без обрезки.
 */
export function DrinkPhoto({
  item,
  className,
  imgClassName,
  fit = "cover",
  activeLayerIds,
}: DrinkPhotoProps) {
  const photo = drinkPhotoUrl(item);
  const isContain = fit === "contain";

  if (!photo) {
    return (
      <span
        className={
          isContain
            ? `grid aspect-square place-items-center ${className ?? ""}`
            : `absolute inset-0 grid place-items-center ${className ?? ""}`
        }
      >
        <span className="scale-[1.6]">
          <LayerStackSvg item={item} />
        </span>
      </span>
    );
  }

  const baseImgClass =
    imgClassName ??
    (isContain
      ? "block h-auto w-full object-contain"
      : "absolute inset-0 size-full object-cover");

  if (activeLayerIds === undefined) {
    return <img src={photo} alt={item.name} loading="lazy" className={baseImgClass} />;
  }

  const overlayDefs = drinkLayerOverlays(item);
  const active = new Set(activeLayerIds);

  if (isContain) {
    return (
      <span className={`relative block w-full ${className ?? ""}`}>
        <img src={photo} alt={item.name} loading="lazy" className={baseImgClass} />
        {overlayDefs.map((overlay) => (
          <img
            key={overlay.layerId}
            src={overlay.src}
            alt=""
            aria-hidden
            loading="lazy"
            className={[
              "pointer-events-none absolute inset-0 size-full object-contain transition-opacity duration-[250ms] ease-out",
              active.has(overlay.layerId) ? "opacity-100" : "opacity-0",
              overlay.className ?? "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </span>
    );
  }

  return (
    <span className={`absolute inset-0 block ${className ?? ""}`}>
      <img src={photo} alt={item.name} loading="lazy" className={baseImgClass} />
      {overlayDefs.map((overlay) => (
        <img
          key={overlay.layerId}
          src={overlay.src}
          alt=""
          aria-hidden
          loading="lazy"
          className={[
            "pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-[250ms] ease-out",
            active.has(overlay.layerId) ? "opacity-100" : "opacity-0",
            overlay.className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </span>
  );
}
