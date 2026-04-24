"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import {
  computeFromBuilderItems,
  CabinetItemLike,
} from "@/lib/pricing-advanced";

type KitchenItemCategory = "base" | "wall" | "tall" | "worktop";

type KitchenItemType =
  | "base-standard"
  | "base-corner"
  | "base-pantry"
  | "wall-standard"
  | "wall-deep"
  | "wall-niche"
  | "tall-standard"
  | "worktop-straight"
  | "worktop-corner";

type KitchenItemFrontConfig =
  | "door"
  | "drawer"
  | "liftup"
  | "fridge"
  | "shelves"
  | "tall-drawers";

type BaseCornerOption = "shelf" | "kidney";

export interface KitchenItem {
  id: string;
  category?: KitchenItemCategory;
  itemType?: KitchenItemType;
  widthCm?: number;
  frontConfig?: KitchenItemFrontConfig;
  drawerCount?: 1 | 2 | 3;
  cornerOption?: BaseCornerOption; // option meuble bas d'angle
  wallHeightCm?: number;           // hauteur meuble haut
}

const WIDTH_OPTIONS = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
const WALL_HEIGHT_OPTIONS = [30, 40, 50, 60, 70, 80, 90];

const CATEGORY_OPTIONS: { value: KitchenItemCategory; label: string }[] = [
  { value: "base", label: "Meuble bas" },
  { value: "wall", label: "Meuble haut" },
  { value: "tall", label: "Colonne" },
  { value: "worktop", label: "Plan de travail" },
];

const ITEM_TYPE_OPTIONS: Record<
  KitchenItemCategory,
  { value: KitchenItemType; label: string }[]
> = {
  base: [
    { value: "base-standard", label: "Meuble bas standard" },
    { value: "base-corner", label: "Meuble bas angle" },
    { value: "base-pantry", label: "Meuble bas épicier" },
  ],
  wall: [
    { value: "wall-standard", label: "Meuble haut standard" },
    { value: "wall-deep", label: "Meuble haut sur-profondeur" },
    { value: "wall-niche", label: "Niche" },
  ],
  tall: [{ value: "tall-standard", label: "Colonne standard" }],
  worktop: [
    { value: "worktop-straight", label: "Plan de travail droit" },
    { value: "worktop-corner", label: "Plan de travail avec retour" },
  ],
};

const FRONT_CONFIG_OPTIONS: Record<
  KitchenItemCategory,
  { value: KitchenItemFrontConfig; label: string }[]
> = {
  base: [
    { value: "door", label: "Porte" },
    { value: "drawer", label: "Tiroirs" },
  ],
  wall: [
    { value: "door", label: "Porte" },
    { value: "liftup", label: "Relevable" },
  ],
  tall: [
    { value: "fridge", label: "Frigo" },
    { value: "shelves", label: "Étagères" },
    { value: "tall-drawers", label: "Tiroirs" },
  ],
  worktop: [],
};

const DRAWER_COUNT_OPTIONS = [
  { value: 1 as const, label: "1 tiroir" },
  { value: 2 as const, label: "2 tiroirs" },
  { value: 3 as const, label: "3 tiroirs" },
];

const BASE_CORNER_OPTIONS: { value: BaseCornerOption; label: string }[] = [
  { value: "shelf", label: "Étagère" },
  { value: "kidney", label: "Haricot" },
];

export function KitchenItemsBuilder() {
  const [items, setItems] = useState<KitchenItem[]>([]);
  const [result, setResult] = useState<ReturnType<
    typeof computeFromBuilderItems
  > | null>(null);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { id: nanoid() }]);
    setResult(null);
  };

  const updateItem = (id: string, partial: Partial<KitchenItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...partial } : item))
    );
    setResult(null);
  };

  const handleCategoryChange = (id: string, categoryValue: string) => {
    const category = categoryValue as KitchenItemCategory;
    updateItem(id, {
      category,
      itemType: undefined,
      frontConfig: undefined,
      drawerCount: undefined,
      widthCm: undefined,
      cornerOption: undefined,
      wallHeightCm: undefined,
    });
  };

  const handleItemTypeChange = (id: string, itemTypeValue: string) => {
    updateItem(id, { itemType: itemTypeValue as KitchenItemType });
  };

  const handleWidthChange = (id: string, widthValue: string) => {
    const width = widthValue ? parseInt(widthValue, 10) : undefined;
    updateItem(id, { widthCm: width });
  };

  const handleFrontConfigChange = (id: string, configValue: string) => {
    const frontConfig = configValue as KitchenItemFrontConfig;
    updateItem(id, { frontConfig, drawerCount: undefined });
  };

  const handleDrawerCountChange = (id: string, countValue: string) => {
    const val = countValue ? (parseInt(countValue, 10) as 1 | 2 | 3) : undefined;
    updateItem(id, { drawerCount: val });
  };

  const handleCornerOptionChange = (id: string, value: string) => {
    const cornerOption = value ? (value as BaseCornerOption) : undefined;
    updateItem(id, { cornerOption });
  };

  const handleWallHeightChange = (id: string, value: string) => {
    const h = value ? parseInt(value, 10) : undefined;
    updateItem(id, { wallHeightCm: h });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setResult(null);
  };

  const handleCalculate = () => {
    const payload: CabinetItemLike[] = items.map((item) => ({
      category: item.category,
      itemType: item.itemType,
      widthCm: item.widthCm,
      heightCm: item.wallHeightCm, // important pour les hauts
      frontConfig: item.frontConfig,
      drawerCount: item.drawerCount,
      cornerOption: item.cornerOption,
    }));

    const r = computeFromBuilderItems(payload);
    setResult(r);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-50">
          Éléments de la cuisine
        </h2>
        <button
          type="button"
          onClick={handleAddItem}
          className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Ajouter un élément
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-slate-400">
          Aucun élément. Cliquez sur “Ajouter un élément” pour commencer.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => {
          const category = item.category;
          const itemTypeOptions = category ? ITEM_TYPE_OPTIONS[category] : [];
          const frontConfigOptions = category
            ? FRONT_CONFIG_OPTIONS[category]
            : [];

          const showFrontConfig = category && category !== "worktop";
          const showDrawerCount =
            category === "base" && item.frontConfig === "drawer";
          const showCornerOption =
            category === "base" && item.itemType === "base-corner";
          const showWallHeight = category === "wall";

          return (
            <div
              key={item.id}
              className="rounded border border-slate-700 p-3 space-y-2 bg-slate-900/80"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-50">
                  Élément {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-sm text-red-400 hover:text-red-300 hover:underline"
                >
                  Supprimer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-200">
                    Catégorie
                  </label>
                  <select
                    className="w-full rounded-md bg-slate-900 text-slate-50 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    value={item.category ?? ""}
                    onChange={(e) =>
                      handleCategoryChange(item.id, e.target.value)
                    }
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-200">
                    Type d&apos;élément
                  </label>
                  <select
                    className="w-full rounded-md bg-slate-900 text-slate-50 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-800 disabled:text-slate-500"
                    value={item.itemType ?? ""}
                    onChange={(e) =>
                      handleItemTypeChange(item.id, e.target.value)
                    }
                    disabled={!category}
                  >
                    <option value="">Sélectionner un type</option>
                    {itemTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-200">
                    Largeur
                  </label>
                  <select
                    className="w-full rounded-md bg-slate-900 text-slate-50 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    value={item.widthCm ?? ""}
                    onChange={(e) => handleWidthChange(item.id, e.target.value)}
                  >
                    <option value="">Sélectionner la largeur</option>
                    {WIDTH_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w} cm
                      </option>
                    ))}
                  </select>
                </div>

                {showFrontConfig && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-200">
                      Configuration de façades
                    </label>
                    <select
                      className="w-full rounded-md bg-slate-900 text-slate-50 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                      value={item.frontConfig ?? ""}
                      onChange={(e) =>
                        handleFrontConfigChange(item.id, e.target.value)
                      }
                    >
                      <option value="">Sélectionner une configuration</option>
                      {frontConfigOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {showWallHeight && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-200">
                      Hauteur meuble haut
                    </label>
                    <select
                      className="w-full rounded-md bg-slate-900 text-slate-50 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                      value={item.wallHeightCm ?? ""}
                      onChange={(e) =>
                        handleWallHeightChange(item.id, e.target.value)
                      }
                    >
                      <option value="">Sélectionner la hauteur</option>
                      {WALL_HEIGHT_OPTIONS.map((h) => (
                        <option key={h} value={h}>
                          {h} cm
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {showCornerOption && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-200">
                      Option meuble d&apos;angle
                    </label>
                    <select
                      className="w-full rounded-md bg-slate-900 text-slate-50 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                      value={item.cornerOption ?? ""}
                      onChange={(e) =>
                        handleCornerOptionChange(item.id, e.target.value)
                      }
                    >
                      <option value="">Sélectionner une option</option>
                      {BASE_CORNER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {showDrawerCount && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-200">
                    Nombre de tiroirs
                  </label>
                  <select
                    className="w-full rounded-md bg-slate-900 text-slate-50 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    value={item.drawerCount ?? ""}
                    onChange={(e) =>
                      handleDrawerCountChange(item.id, e.target.value)
                    }
                  >
                    <option value="">Sélectionner</option>
                    {DRAWER_COUNT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleCalculate}
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Calculer le devis
          </button>
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/80 p-4 text-sm space-y-3">
          <h3 className="text-base font-semibold text-slate-50 mb-2">
            Détail par élément
          </h3>

          <div className="space-y-2 max-h-80 overflow-auto pr-1">
            {result.detailed.map((row, idx) =>
              !row.price ? (
                <div
                  key={row.item.id || idx}
                  className="rounded border border-slate-700/60 p-2 text-slate-300"
                >
                  Élément {idx + 1} : configuration incomplète (non chiffré).
                </div>
              ) : (
                <div
                  key={row.item.id || idx}
                  className="rounded border border-slate-700/60 p-2 text-slate-200"
                >
                  <div className="font-medium text-slate-50 mb-1">
                    Élément {idx + 1} – {row.item.category} / {row.item.itemType}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span>
                      Matière : {row.price.materialPrice.toFixed(2)} € HT
                    </span>
                    <span>
                      Temps : {row.price.laborHours.toFixed(2)} h
                    </span>
                    <span>
                      Atelier : {row.price.laborCost.toFixed(2)} € HT
                    </span>
                    <span className="font-semibold text-slate-50">
                      Total : {row.price.totalPrice.toFixed(2)} € HT
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="pt-2 border-t border-slate-700/60 mt-2 space-y-1">
            <p className="text-slate-200">
              Matière totale : {result.totals.material.toFixed(2)} € HT
            </p>
            <p className="text-slate-200">
              Temps atelier : {result.totals.laborHours.toFixed(2)} h
            </p>
            <p className="text-slate-200">
              Coût atelier : {result.totals.laborCost.toFixed(2)} € HT
            </p>
            <p className="text-slate-200">
              Jours de pose estimés :{" "}
              {result.totals.installationDays.toFixed(2)} j
            </p>
            <p className="text-slate-200">
              Coût pose (HT) : {result.totals.installationCost.toFixed(2)} €
            </p>
            <p className="text-slate-200">
              Total HT (meubles + pose, sans marge) :{" "}
              {(result.totals.totalHTMeubles + result.totals.installationCost).toFixed(
                2
              )}{" "}
              €
            </p>
            <p className="text-slate-200">
              Marge commerciale ({(result.totals.marginRate * 100).toFixed(0)}{" "}
              %) : {result.totals.marginAmount.toFixed(2)} € HT
            </p>
            <p className="text-slate-200">
              Total HT avec marge :{" "}
              {result.totals.totalHTAvecMarge.toFixed(2)} €
            </p>
            <p className="text-slate-200">
              TVA ({(result.totals.vatRate * 100).toFixed(0)} %) :{" "}
              {result.totals.vatAmount.toFixed(2)} €
            </p>
            <p className="text-slate-50 font-semibold">
              Total TTC : {result.totals.totalTTC.toFixed(2)} €
            </p>
          </div>
        </div>
      )}
    </div>
  );
}