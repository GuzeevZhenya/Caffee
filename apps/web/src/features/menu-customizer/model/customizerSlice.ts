import type { RootState } from "@/app/store";
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  buildConfiguration,
  calculateItemTotals,
  getDefaultActiveLayerIds,
  type CustomConfiguration,
  type CustomItemTotals,
  type MenuItem3DConfig,
  type MenuItemLayerConfig,
} from "@repo/shared";

/**
 * Кастомизация блюда в 3D-конструкторе.
 * Хранит только ID активных слоёв по каждому блюду — метаданные слоёв
 * всегда берутся из menuApi (единый источник правды), а цена/КБЖУ
 * пересчитываются селектором через calculateItemTotals из @repo/shared.
 */
export interface CustomizerState {
  /** itemId → активные слои */
  activeByItem: Record<string, string[]>;
}

const initialState: CustomizerState = {
  activeByItem: {},
};

const customizerSlice = createSlice({
  name: "customizer",
  initialState,
  reducers: {
    /** Ленивая инициализация дефолтным рецептом при открытии блюда */
    initializeCustomization(state, action: PayloadAction<MenuItem3DConfig>) {
      const item = action.payload;
      if (!state.activeByItem[item.id]) {
        state.activeByItem[item.id] = getDefaultActiveLayerIds(item);
      }
    },
    /**
     * Переключить слой. Защита на уровне стейта:
     * трогать можно только съёмные базовые слои (isRemovable)
     * и платные добавки (isOptionalAdd).
     */
    toggleLayer(
      state,
      action: PayloadAction<{ item: MenuItem3DConfig; layer: MenuItemLayerConfig }>,
    ) {
      const { item, layer } = action.payload;
      if (!layer.isRemovable && !layer.isOptionalAdd) return;

      const current = state.activeByItem[item.id] ?? getDefaultActiveLayerIds(item);
      state.activeByItem[item.id] = current.includes(layer.id)
        ? current.filter((id) => id !== layer.id)
        : [...current, layer.id];
    },
    resetCustomization(state, action: PayloadAction<MenuItem3DConfig>) {
      state.activeByItem[action.payload.id] = getDefaultActiveLayerIds(action.payload);
    },
  },
});

export const { initializeCustomization, toggleLayer, resetCustomization } = customizerSlice.actions;

export const customizerReducer = customizerSlice.reducer;

// ---------------------------------------------------------------------------
// Селекторы
// ---------------------------------------------------------------------------

export const selectActiveLayerIds = (state: RootState, item: MenuItem3DConfig): string[] =>
  state.customizer.activeByItem[item.id] ?? getDefaultActiveLayerIds(item);

/** Живой пересчёт цены и КБЖУ кастомного блюда (мемоизирован) */
export const selectCustomizerTotals = createSelector(
  [
    (state: RootState, item: MenuItem3DConfig) => state.customizer.activeByItem[item.id],
    (_state: RootState, item: MenuItem3DConfig) => item,
  ],
  (activeIds, item): CustomItemTotals =>
    calculateItemTotals(item, activeIds ?? getDefaultActiveLayerIds(item)),
);

/** Слепок кастомизации для отправки в корзину/заказ */
export const selectConfiguration = createSelector(
  [
    (state: RootState, item: MenuItem3DConfig) => state.customizer.activeByItem[item.id],
    (_state: RootState, item: MenuItem3DConfig) => item,
  ],
  (activeIds, item): CustomConfiguration =>
    buildConfiguration(item, activeIds ?? getDefaultActiveLayerIds(item)),
);
