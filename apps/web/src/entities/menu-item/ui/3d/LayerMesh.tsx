import type { MenuItemLayerConfig } from "@repo/shared";

interface LayerMeshProps {
  layer: MenuItemLayerConfig;
  onSelect?: (layerId: string) => void;
}

/**
 * Процедурный рендер одного слоя блюда (fallback без .glb).
 * Геометрия выбирается по primitiveType, размеры — из heightScale/radiusScale,
 * материал — colorHex/opacity/roughness из конфига слоя.
 * CUSTOM_MESH (.glb) пока рендерится боксом-заглушкой — поддержка моделей
 * появится вместе с первыми реальными ассетами.
 */
export function LayerMesh({ layer, onSelect }: LayerMeshProps) {
  const { primitiveType, radiusScale, heightScale, material } = layer;
  const isTransparent = material.opacity < 1;
  // Тор лежит в плоскости XY — поворачиваем горизонтально (как слой)
  const rotation: [number, number, number] =
    primitiveType === "TORUS" ? [Math.PI / 2, 0, 0] : [0, 0, 0];

  return (
    <mesh
      castShadow
      receiveShadow
      rotation={rotation}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(layer.id);
      }}
    >
      {primitiveType === "CYLINDER" ? (
        <cylinderGeometry args={[radiusScale, radiusScale, heightScale, 48]} />
      ) : null}
      {primitiveType === "BOX" ? (
        <boxGeometry args={[radiusScale * 2, heightScale, radiusScale * 2]} />
      ) : null}
      {primitiveType === "SPHERE" ? <sphereGeometry args={[radiusScale, 48, 32]} /> : null}
      {primitiveType === "TORUS" ? (
        <torusGeometry args={[radiusScale, Math.max(heightScale / 2, 0.02), 24, 64]} />
      ) : null}
      {primitiveType === "CUSTOM_MESH" ? (
        <boxGeometry args={[radiusScale * 2, heightScale, radiusScale * 2]} />
      ) : null}
      <meshStandardMaterial
        color={material.colorHex}
        transparent={isTransparent}
        opacity={material.opacity}
        roughness={material.roughness}
      />
    </mesh>
  );
}
