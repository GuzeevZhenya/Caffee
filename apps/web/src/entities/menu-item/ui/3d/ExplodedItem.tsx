import type { MenuItem3DConfig, MenuItemLayerConfig } from "@repo/shared";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useMemo, useRef } from "react";
import { LayerHtmlPin } from "./LayerHtmlPin";
import { LayerMesh } from "./LayerMesh";
import { ProceduralCoffeeCup, ProceduralPlate } from "./ProceduralCoffeeCup";

export type SceneTimeOfDay = "day" | "evening";
export type DishBase = "cup" | "plate";

interface ExplodedItemProps {
  item: MenuItem3DConfig;
  /** ID слоёв текущей конфигурации (неактивные не рендерятся — они убраны из рецепта) */
  activeLayerIds: string[];
  /** true — блюдо разобрано на слои (Exploded View) */
  isExploded: boolean;
  timeOfDay?: SceneTimeOfDay;
  /** Основа под блюдом: чашка (напитки) или тарелка (десерты/выпечка) */
  base?: DishBase;
  focusedLayerId?: string | null;
  onLayerClick?: (layerId: string) => void;
  className?: string;
}

/** Группа одного слоя с плавной анимацией разлёта по оси Y */
function AnimatedLayer({
  layer,
  isExploded,
  focused,
  onSelect,
}: {
  layer: MenuItemLayerConfig;
  isExploded: boolean;
  focused: boolean;
  onSelect?: (layerId: string) => void;
}) {
  const groupRef = useRef<import("three").Group>(null);
  const progress = useRef(0);

  useFrame((_state, delta) => {
    easing.damp(progress, "current", isExploded ? 1 : 0, 0.22, delta);
    const group = groupRef.current;
    if (group) {
      group.position.y = layer.basePositionY + layer.explodeOffsetY * progress.current;
    }
  });

  return (
    <group ref={groupRef} position={[0, layer.basePositionY, 0]}>
      <LayerMesh layer={layer} onSelect={onSelect} />
      {isExploded ? <LayerHtmlPin layer={layer} focused={focused} onSelect={onSelect} /> : null}
    </group>
  );
}

/** Освещение сцены под время суток, цвет среды — из конфига блюда */
function SceneLights({ item, timeOfDay }: { item: MenuItem3DConfig; timeOfDay: SceneTimeOfDay }) {
  const isDay = timeOfDay === "day";
  return (
    <>
      <ambientLight color={item.ambientColorHex} intensity={isDay ? 0.85 : 0.35} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={isDay ? 1.4 : 0.8}
        color={isDay ? "#ffffff" : "#ffd9a0"}
        castShadow
      />
      <directionalLight position={[-3, 3, -4]} intensity={isDay ? 0.35 : 0.15} />
    </>
  );
}

/**
 * Ядро 3D-конструктора: блюдо, разбирающееся на слои по оси Y.
 * Чистый «entity»-компонент: весь стейт (explode, активные слои, время суток)
 * приходит пропсами — Redux живёт на уровне widget.
 */
export function ExplodedItem({
  item,
  activeLayerIds,
  isExploded,
  timeOfDay = "day",
  base = "plate",
  focusedLayerId = null,
  onLayerClick,
  className,
}: ExplodedItemProps) {
  const activeLayers = useMemo(() => {
    const activeSet = new Set(activeLayerIds);
    return item.layers
      .filter((layer) => activeSet.has(layer.id))
      .sort((a, b) => a.layerOrder - b.layerOrder);
  }, [item, activeLayerIds]);

  const { cameraPreset } = item;
  const isDay = timeOfDay === "day";

  return (
    <div
      className={`overflow-hidden rounded-xl ${
        isDay
          ? "bg-gradient-to-b from-amber-50 via-neutral-100 to-neutral-200"
          : "bg-gradient-to-b from-neutral-900 via-neutral-800 to-amber-950"
      } ${className ?? ""}`}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: cameraPreset.position, fov: cameraPreset.fov }}
      >
        <SceneLights item={item} timeOfDay={timeOfDay} />
        <group scale={item.scale3D}>
          {base === "cup" ? <ProceduralCoffeeCup /> : <ProceduralPlate />}
          {activeLayers.map((layer) => (
            <AnimatedLayer
              key={layer.id}
              layer={layer}
              isExploded={isExploded}
              focused={focusedLayerId === layer.id}
              onSelect={onLayerClick}
            />
          ))}
        </group>
        <ContactShadows position={[0, -0.09, 0]} opacity={0.45} scale={8} blur={2.4} />
        <OrbitControls
          target={cameraPreset.target}
          enablePan={false}
          minDistance={2}
          maxDistance={9}
        />
      </Canvas>
    </div>
  );
}
