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
type WorktopPriceUnit = "ml" | "m2";

export interface KitchenItem {
  id: string;
  category?: KitchenItemCategory;
  itemType?: KitchenItemType;
  widthCm?: number;
  frontConfig?: KitchenItemFrontConfig;
  drawerCount?: 1 | 2 | 3;
  cornerOption?: BaseCornerOption;
  wallHeightCm?: number;
  worktopPrice?: number;
  worktopUnit?: WorktopPriceUnit;
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

const WORKTOP_DEPTH_M = 0.65;

// Helpers pour récupérer les labels
const categoryLabel = (value?: KitchenItemCategory) => {
  if (!value) return "";
  const opt = CATEGORY_OPTIONS.find((o) => o.value === value);
  return opt ? opt.label : value;
};

const itemTypeLabel = (
  category?: KitchenItemCategory,
  value?: KitchenItemType,
) => {
  if (!category || !value) return "";
  const list = ITEM_TYPE_OPTIONS[category] || [];
  const opt = list.find((o) => o.value === value);
  return opt ? opt.label : value;
};

const frontConfigLabel = (
  category?: KitchenItemCategory,
  value?: KitchenItemFrontConfig,
) => {
  if (!category || !value) return "";
  const list = FRONT_CONFIG_OPTIONS[category] || [];
  const opt = list.find((o) => o.value === value);
  return opt ? opt.label : value;
};

// API Next locale (proxy)
const GOOGLE_SCRIPT_PROXY_URL = "/api/google-quote";

export function KitchenItemsBuilder() {
  const [items, setItems] = useState<KitchenItem[]>([]);
  const [result, setResult] = useState<
    ReturnType<typeof computeFromBuilderItems> | null
  >(null);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { id: nanoid() }]);
    setResult(null);
  };

  const updateItem = (id: string, partial: Partial<KitchenItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...partial } : item)),
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
      worktopPrice: undefined,
      worktopUnit: undefined,
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
    const val = countValue
      ? (parseInt(countValue, 10) as 1 | 2 | 3)
      : undefined;
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

  const handleWorktopPriceChange = (id: string, value: string) => {
    const price = value ? parseFloat(value) : undefined;
    updateItem(id, {
      worktopPrice:
        price !== undefined && !Number.isNaN(price) ? price : undefined,
    });
  };

  const handleWorktopUnitChange = (id: string, value: string) => {
    const unit = value ? (value as WorktopPriceUnit) : undefined;
    updateItem(id, { worktopUnit: unit });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setResult(null);
  };

  // Dupliquer un élément
  const handleDuplicateItem = (id: string) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;

      const original = prev[index];

      const duplicated: KitchenItem = {
        ...original,
        id: nanoid(),
      };

      const newItems = [...prev];
      newItems.splice(index + 1, 0, duplicated);
      return newItems;
    });
    setResult(null);
  };

  const handleCalculate = () => {
    const payload: CabinetItemLike[] = items.map((item) => ({
      id: item.id,
      category: item.category,
      itemType: item.itemType,
      widthCm: item.widthCm,
      heightCm: item.wallHeightCm,
      frontConfig: item.frontConfig,
      drawerCount: item.drawerCount,
      cornerOption: item.cornerOption,
    }));

    const r = computeFromBuilderItems(payload);
    setResult(r);
  };

  const handleDownloadQuote = () => {
    if (!result) return;

    const headers = [
      "Élément",
      "Catégorie",
      "Type",
      "Largeur (cm)",
      "Hauteur (cm)",
      "Façades",
      "Matière HT",
      "Atelier HT",
      "Total HT",
    ];

    const rows = result.detailed.map((row, idx) => {
      const item = row.item;
      const price = row.price;

      const cat = categoryLabel(
        item.category as KitchenItemCategory | undefined,
      );
      const type = itemTypeLabel(
        item.category as KitchenItemCategory | undefined,
        item.itemType as KitchenItemType | undefined,
      );
      const front = frontConfigLabel(
        item.category as KitchenItemCategory | undefined,
        item.frontConfig as KitchenItemFrontConfig | undefined,
      );

      return [
        idx + 1,
        cat,
        type,
        item.widthCm ?? "",
        item.heightCm ?? "",
        front,
        price ? price.materialPrice.toFixed(2) : "",
        price ? price.laborCost.toFixed(2) : "",
        price ? price.totalPrice.toFixed(2) : "",
      ];
    });

    rows.push([]);
    rows.push([
      "Totaux",
      "",
      "",
      "",
      "",
      "",
      result.totals.material.toFixed(2),
      result.totals.laborCost.toFixed(2),
      (result.totals.totalHTMeubles + result.totals.installationCost).toFixed(
        2,
      ),
    ]);

    const csvContent = [headers, ...rows]
      .map((line) => line.join(";"))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "devis-cuisine.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ENVOI VERS GOOGLE SHEETS via API Next (proxy)
  const handleSendToGoogleSheet = async () => {
    if (!result) return;

    const FURNITURE_MARGIN_RATE = 0.30; // 30 % sur (matière + atelier)

    // 1) Préparation des lignes meubles AVANT fusion
    type RawLine = {
      key: string;
      designation: string;
      qty: number;
      priceHT: number; // prix unitaire HT (avec marge)
    };

    const rawLines: RawLine[] = result.detailed
      .filter((row) => row.price)
      .map((row) => {
        const item = row.item;
        const price = row.price!;
        const type = itemTypeLabel(
          item.category as KitchenItemCategory | undefined,
          item.itemType as KitchenItemType | undefined,
        );
        const front = frontConfigLabel(
          item.category as KitchenItemCategory | undefined,
          item.frontConfig as KitchenItemFrontConfig | undefined,
        );

        // Désignation SANS "Élément X" et SANS catégorie
        const parts: string[] = [];
        if (type) parts.push(type);

        if (item.widthCm || item.heightCm) {
          let dim = "";
          if (item.widthCm) dim += `${item.widthCm} cm`;
          if (item.widthCm && item.heightCm) dim += " x ";
          if (item.heightCm) dim += `${item.heightCm} cm`;
          if (dim) parts.push(dim);
        }

        if (front) parts.push(`façades : ${front}`);

        const designation = parts.join(" / ");

        // Clé de regroupement : toutes les caractéristiques produit
        const key = JSON.stringify({
          itemType: item.itemType,
          widthCm: item.widthCm,
          heightCm: item.heightCm,
          frontConfig: item.frontConfig,
          drawerCount: item.drawerCount,
          cornerOption: item.cornerOption,
        });

        // coûts réels
        const materialCost = price.materialPrice;
        const laborCost = price.laborCost;
        const baseFurnitureCost = materialCost + laborCost;

        // marge 30 % sur (matière + atelier)
        const marginAmount = baseFurnitureCost * FURNITURE_MARGIN_RATE;
        const sellingPrice = baseFurnitureCost + marginAmount; // prix unitaire HT

        return {
          key,
          designation,
          qty: 1,
          priceHT: sellingPrice,
        };
      });

    // 2) Fusion des lignes identiques (group by)
    const groupedMap = new Map<string, RawLine>();

    for (const line of rawLines) {
      const existing = groupedMap.get(line.key);
      if (existing) {
        existing.qty += 1;
      } else {
        groupedMap.set(line.key, { ...line });
      }
    }

    const groupedLines = Array.from(groupedMap.values());

    // 3) Construction rowsMeubles pour Google Sheets
    // Format envoyé : [designation, qty, priceHT]
    const rowsMeubles: (string | number)[][] = groupedLines.map((line) => [
      line.designation,
      line.qty,
      parseFloat(line.priceHT.toFixed(2)),
    ]);

    // 4) Lignes de pose : [designation, qty, priceHT]
    const rowsPose: (string | number)[][] = [];
    if (
      result.totals.installationCost > 0 &&
      result.totals.installationDays > 0
    ) {
      const designation = "Pose cuisine (meubles + plan de travail)";
      const qtyJours = parseFloat(result.totals.installationDays.toFixed(2));
      const prixJourHT = result.totals.installationCost / qtyJours;

      rowsPose.push([
        designation,
        qtyJours,
        parseFloat(prixJourHT.toFixed(2)),
      ]);
    }

    const payload = {
      rowsMeubles,
      rowsPose,
      totals: {},
    };

    // AJOUT pour le test : log du payload
    console.log("Payload envoyé à Google Sheets:", payload);

    try {
      const res = await fetch(GOOGLE_SCRIPT_PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("Réponse brute proxy/Apps Script:", text);

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Réponse non JSON du proxy/Apps Script:", text);
        alert("Réponse inattendue de Google Sheets (voir console).");
        return;
      }

      if (data.status === "success" && data.url) {
        window.open(data.url, "_blank");
      } else {
        console.error(
          "Erreur Apps Script (JSON OK mais status pas success):",
          data,
        );
        alert("Erreur lors de la création du Google Sheet (voir console).");
      }
    } catch (err) {
      console.error("Erreur fetch vers l'API Next:", err);
      alert("Erreur réseau vers l'API locale (proxy).");
    }
  };

  const totalBaseWidthCm = items
    .filter((i) => i.category === "base" && i.widthCm)
    .reduce((sum, i) => sum + (i.widthCm || 0), 0);
  const totalBaseLengthM = totalBaseWidthCm / 100;

  const worktopItem = items.find(
    (i) => i.category === "worktop" && i.worktopPrice !== undefined,
  );

  let worktopTotalHT = 0;
  let worktopSurfaceM2 = 0;

  if (worktopItem && worktopItem.worktopPrice && totalBaseLengthM > 0) {
    if (worktopItem.worktopUnit === "m2") {
      worktopSurfaceM2 = totalBaseLengthM * WORKTOP_DEPTH_M;
      worktopTotalHT = worktopSurfaceM2 * worktopItem.worktopPrice;
    } else {
      worktopTotalHT = totalBaseLengthM * worktopItem.worktopPrice;
    }
  }

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
          const showWorktopFields = category === "worktop";

          return (
            <div
              key={item.id}
              className="rounded border border-slate-700 p-3 space-y-2 bg-slate-900/80"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-50">
                  Élément {index + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDuplicateItem(item.id)}
                    className="text-xs text-sky-400 hover:text-sky-300 hover:underline"
                  >
                    Dupliquer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-xs text-red-400 hover:text-red-300 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
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

              {showWorktopFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-200">
                      Prix plan de travail
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-full rounded-md bg-slate-900 text-slate-50 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                      value={item.worktopPrice ?? ""}
                      onChange={(e) =>
                        handleWorktopPriceChange(item.id, e.target.value)
                      }
                      placeholder="Prix HT"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-200">
                      Unité du prix
                    </label>
                    <select
                      className="w-full rounded-md bg-slate-900 text-slate-50 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                      value={item.worktopUnit ?? "ml"}
                      onChange={(e) =>
                        handleWorktopUnitChange(item.id, e.target.value)
                      }
                    >
                      <option value="ml">€/mètre linéaire</option>
                      <option value="m2">€/mètre carré</option>
                    </select>
                  </div>
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
            {result.detailed.map((row, idx) => {
              const isWorktop = row.item.category === "worktop";

              const catLabel = categoryLabel(
                row.item.category as KitchenItemCategory | undefined,
              );
              const typeLabel = itemTypeLabel(
                row.item.category as KitchenItemCategory | undefined,
                row.item.itemType as KitchenItemType | undefined,
              );
              const frontLabel = frontConfigLabel(
                row.item.category as KitchenItemCategory | undefined,
                row.item.frontConfig as KitchenItemFrontConfig | undefined,
              );

              if (!row.price) {
                if (isWorktop) {
                  return (
                    <div
                      key={idx}
                      className="rounded border border-slate-700/60 p-2 text-slate-200"
                    >
                      <div className="font-medium text-slate-50 mb-1">
                        Élément {idx + 1}
                        {catLabel && <> – {catLabel}</>}
                        {typeLabel && <> / {typeLabel}</>}
                        {row.item.widthCm && <> / {row.item.widthCm} cm</>}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span>
                          Longueur prise en compte :{" "}
                          {totalBaseLengthM.toFixed(2)} m
                        </span>
                        {worktopSurfaceM2 > 0 && (
                          <span>
                            Surface estimée : {worktopSurfaceM2.toFixed(2)} m²
                          </span>
                        )}
                        <span className="font-semibold text-slate-50">
                          Total plan de travail : {worktopTotalHT.toFixed(2)} € HT
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="rounded border border-slate-700/60 p-2 text-slate-300"
                  >
                    Élément {idx + 1} : configuration incomplète (non chiffré).
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="rounded border border-slate-700/60 p-2 text-slate-200"
                >
                  <div className="font-medium text-slate-50 mb-1">
                    Élément {idx + 1}
                    {catLabel && <> – {catLabel}</>}
                    {typeLabel && <> / {typeLabel}</>}
                    {(row.item.widthCm || row.item.heightCm) && (
                      <>
                        {" / "}
                        {row.item.widthCm && `${row.item.widthCm} cm`}
                        {row.item.widthCm && row.item.heightCm && " x "}
                        {row.item.heightCm && `${row.item.heightCm} cm`}
                      </>
                    )}
                    {frontLabel && <> / façades : {frontLabel}</>}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span>
                      Matière : {row.price.materialPrice.toFixed(2)} € HT
                    </span>
                    <span>Temps : {row.price.laborHours.toFixed(2)} h</span>
                    <span>
                      Atelier : {row.price.laborCost.toFixed(2)} € HT
                    </span>
                    <span className="font-semibold text-slate-50">
                      Total : {row.price.totalPrice.toFixed(2)} € HT
                    </span>
                  </div>
                </div>
              );
            })}
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
              {(
                result.totals.totalHTMeubles +
                result.totals.installationCost
              ).toFixed(2)}{" "}
              €
            </p>

            <p className="text-slate-200">
              Total linéaire meubles bas : {totalBaseLengthM.toFixed(2)} m
            </p>

            {worktopTotalHT > 0 && (
              <p className="text-slate-200">
                Plan de travail (1 prix global) :{" "}
                {worktopTotalHT.toFixed(2)} € HT
              </p>
            )}

            {(() => {
              const baseHTSansMarge =
                result.totals.totalHTMeubles +
                result.totals.installationCost;

              const baseHTAvecPlan = baseHTSansMarge + worktopTotalHT;
              const margeAvecPlan =
                baseHTAvecPlan * result.totals.marginRate;
              const totalHTAvecMargeEtPlan =
                baseHTAvecPlan + margeAvecPlan;
              const tvaAvecPlan =
                totalHTAvecMargeEtPlan * result.totals.vatRate;
              const totalTTCAvecPlan = totalHTAvecMargeEtPlan + tvaAvecPlan;

              return worktopTotalHT > 0 ? (
                <>
                  <p className="text-slate-200">
                    Marge commerciale (
                    {(result.totals.marginRate * 100).toFixed(0)} %) :{" "}
                    {margeAvecPlan.toFixed(2)} € HT
                  </p>
                  <p className="text-slate-200">
                    Total HT avec marge :{" "}
                    {totalHTAvecMargeEtPlan.toFixed(2)} €
                  </p>
                  <p className="text-slate-200">
                    TVA ({(result.totals.vatRate * 100).toFixed(0)} %) :{" "}
                    {tvaAvecPlan.toFixed(2)} €
                  </p>
                  <p className="text-slate-50 font-semibold">
                    Total TTC : {totalTTCAvecPlan.toFixed(2)} €
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-200">
                    Marge commerciale (
                    {(result.totals.marginRate * 100).toFixed(0)} %) :{" "}
                    {result.totals.marginAmount.toFixed(2)} € HT
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
                </>
              );
            })()}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleDownloadQuote}
              className="rounded-md bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Télécharger le devis (CSV)
            </button>
            <button
              type="button"
              onClick={handleSendToGoogleSheet}
              className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Envoyer vers Google Sheets
            </button>
          </div>
        </div>
      )}
    </div>
  );
}