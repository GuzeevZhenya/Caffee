/** Цвет фарфора посуды по умолчанию */
const PORCELAIN_HEX = "#f5efe6";

interface ProceduralCoffeeCupProps {
  colorHex?: string;
}

/**
 * Процедурная чашка с блюдцем — декоративная основа для напитков.
 * Радиус чуть больше максимального radiusScale слоёв (1.0),
 * чтобы в собранном виде «жидкость» пряталась внутри чашки.
 */
export function ProceduralCoffeeCup({ colorHex = PORCELAIN_HEX }: ProceduralCoffeeCupProps) {
  return (
    <group>
      {/* Блюдце */}
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <cylinderGeometry args={[1.55, 1.35, 0.08, 64]} />
        <meshStandardMaterial color={colorHex} roughness={0.25} />
      </mesh>
      {/* Тело чашки */}
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.08, 0.78, 1.28, 64]} />
        <meshStandardMaterial color={colorHex} roughness={0.25} />
      </mesh>
      {/* Ручка */}
      <mesh position={[1.18, 0.7, 0]} castShadow>
        <torusGeometry args={[0.32, 0.07, 16, 48]} />
        <meshStandardMaterial color={colorHex} roughness={0.25} />
      </mesh>
    </group>
  );
}

/** Плоская тарелка — основа для десертов и выпечки */
export function ProceduralPlate({ colorHex = PORCELAIN_HEX }: ProceduralCoffeeCupProps) {
  return (
    <mesh position={[0, -0.04, 0]} receiveShadow>
      <cylinderGeometry args={[1.9, 1.6, 0.08, 64]} />
      <meshStandardMaterial color={colorHex} roughness={0.25} />
    </mesh>
  );
}
