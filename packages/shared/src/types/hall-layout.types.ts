/**
 * 2D-план зала (Фаза 4). Координаты в «метрах» той же системы, что position3D:
 * x вправо, z «вниз» по плану (север / окна ≈ отрицательный z).
 */

export type HallFixtureKind = "wall" | "window" | "door" | "toilet" | "bar" | "label";

export interface HallBounds {
  /** мин x, мин z, макс x, макс z */
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
}

export interface HallFixture {
  id: string;
  kind: HallFixtureKind;
  /** Левый-верхний угол прямоугольника на плане (x, z) */
  x: number;
  z: number;
  width: number;
  depth: number;
  label?: string;
}

export interface HallLayout {
  bounds: HallBounds;
  fixtures: HallFixture[];
}
