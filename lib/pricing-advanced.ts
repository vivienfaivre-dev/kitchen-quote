// lib/pricing-advanced.ts

// ========= TYPES EXISTANTS (FORMULAIRE GLOBAL) =========

export type KitchenRange = 'entry' | 'mid' | 'premium';

export type KitchenQuoteInput = {
  // Contexte global
  roomLength: number;          // linéaire principal utile (m)
  hasIsland: boolean;
  range: KitchenRange;

  // Meubles bas / hauts / colonnes (nombre de caissons)
  baseCabinets: number;
  wallCabinets: number;
  tallCabinets: number;

  // Intérieurs / tiroirs
  drawers: number;
  pullouts: number;            // colonnes à sortie totale, etc.

  // Plans de travail & crédences (m² ou ml selon ton usage)
  worktopLength: number;       // ml de plan de travail
  worktopDepth: number;        // profondeur moyenne (m), ex: 0.65
  backsplashLength: number;    // longueur crédence (ml)
  backsplashHeight: number;    // hauteur crédence (m), ex: 0.5

  // Finitions & quincaillerie
  handles: number;
  ledStrips: number;           // nombre de bandes LED ou ml

  // Électroménager
  appliancesCount: number;

  // Services
  installation: boolean;
  delivery: boolean;
  removal: boolean;            // dépose / évacuation ancien

  // Divers
  customWork: boolean;         // sur-mesure, découpes spéciales
};

export type KitchenQuoteBreakdown = {
  cabinetsPrice: number;
  interiorsPrice: number;
  worktopPrice: number;
  backsplashPrice: number;
  finishingPrice: number;
  hardwarePrice: number;
  appliancesPrice: number;

  // Services – détail
  servicesPrice: number;
  installationPrice: number;
  deliveryPrice: number;
  removalPrice: number;
  customWorkServicePrice: number;

  materialSubtotal: number;
  optionsTotal: number;
  marginAmount: number;
  totalPrice: number;

  // Temps de fabrication
  fabricationHours: number;
  fabricationCost: number;
};

function getRangeMultiplier(range: KitchenRange): number {
  switch (range) {
    case 'entry':
      return 0.85;
    case 'premium':
      return 1.25;
    default:
      return 1.0;
  }
}

export function computeKitchenQuote(input: KitchenQuoteInput): KitchenQuoteBreakdown {
  const rangeFactor = getRangeMultiplier(input.range);

  // Prix unitaires de base (ancienne logique globale)
  const baseCabinetUnit = 220 * rangeFactor;
  const wallCabinetUnit = 180 * rangeFactor;
  const tallCabinetUnit = 350 * rangeFactor;

  const drawerUnit = 65 * rangeFactor;
  const pulloutUnit = 140 * rangeFactor;

  const worktopM2Unit = 190 * rangeFactor;
  const backsplashM2Unit = 90 * rangeFactor;

  const handleUnit = 8 * rangeFactor;
  const ledUnit = 35 * rangeFactor;

  const applianceUnit = 380 * rangeFactor;

  // Services fixes (hors pose)
  const deliveryBase = 180;
  const removalBase = 250;
  const customWorkBase = 350 * rangeFactor;

  // Calcul surfaces
  const worktopArea = input.worktopLength * input.worktopDepth;
  const backsplashArea = input.backsplashLength * input.backsplashHeight;

  // Meubles
  const cabinetsPrice =
    input.baseCabinets * baseCabinetUnit +
    input.wallCabinets * wallCabinetUnit +
    input.tallCabinets * tallCabinetUnit;

  // Intérieurs
  const interiorsPrice =
    input.drawers * drawerUnit +
    input.pullouts * pulloutUnit;

  // Plans & crédences
  const worktopPrice = worktopArea * worktopM2Unit;
  const backsplashPrice = backsplashArea * backsplashM2Unit;

  // Finitions / quincaillerie
  const hardwarePrice =
    input.handles * handleUnit +
    input.ledStrips * ledUnit;

  // Finitions “générales” – forfait
  const finishingPrice = 150 * rangeFactor;

  // Électros
  const appliancesPrice = input.appliancesCount * applianceUnit;

  // --- Temps de fabrication (artisan seul) ---
  const fabricationHoursFromCabinets =
    input.baseCabinets * 2.0 +
    input.wallCabinets * 1.5 +
    input.tallCabinets * 3.0;

  const fabricationHoursFromInteriors =
    input.drawers * 0.5 +
    input.pullouts * 1.5;

  const fabricationHoursFromCustom = input.customWork ? 8 : 0;

  const fabricationHours =
    fabricationHoursFromCabinets +
    fabricationHoursFromInteriors +
    fabricationHoursFromCustom;

  const hoursPerDay = 8;
  const dayRate = 500; // 500 € / jour
  const fabricationCost = (fabricationHours / hoursPerDay) * dayRate;

  // --- Services (pose / livraison / dépose) ---
  let servicesPrice = 0;
  let installationPrice = 0;
  let deliveryPriceTotal = 0;
  let removalPriceTotal = 0;
  let customWorkServicePrice = 0;

  if (input.installation) {
    const totalCabinets =
      input.baseCabinets + input.wallCabinets + input.tallCabinets;

    const installationDays = Math.max(1, totalCabinets * 0.125);
    const installationBase = installationDays * dayRate;

    installationPrice = installationBase;
    servicesPrice += installationBase;
  }

  if (input.delivery) {
    deliveryPriceTotal = deliveryBase;
    servicesPrice += deliveryBase;
  }

  if (input.removal) {
    removalPriceTotal = removalBase;
    servicesPrice += removalBase;
  }

  if (input.customWork) {
    customWorkServicePrice = customWorkBase;
    servicesPrice += customWorkBase;
  }

  const materialSubtotal =
    cabinetsPrice +
    interiorsPrice +
    worktopPrice +
    backsplashPrice +
    finishingPrice +
    hardwarePrice +
    appliancesPrice;

  const optionsTotal = servicesPrice + fabricationCost;

  const marginRate = 0.25;
  const marginAmount = (materialSubtotal + optionsTotal) * marginRate;

  const totalPrice = materialSubtotal + optionsTotal + marginAmount;

  return {
    cabinetsPrice,
    interiorsPrice,
    worktopPrice,
    backsplashPrice,
    finishingPrice,
    hardwarePrice,
    appliancesPrice,
    servicesPrice,
    installationPrice,
    deliveryPrice: deliveryPriceTotal,
    removalPrice: removalPriceTotal,
    customWorkServicePrice,
    materialSubtotal,
    optionsTotal,
    marginAmount,
    totalPrice,
    fabricationHours,
    fabricationCost,
  };
}

// ========= NOUVELLE PARTIE : PRICING PAR MEUBLE =========

const BASE_BASE_CABINET_MATERIAL = 53;   // 30 + 12 + 11
const BASE_BASE_CABINET_WIDTH = 60;
const BASE_BASE_CABINET_HOURS = 1.5;

const BASE_WALL_CABINET_MATERIAL = 39;   // 20 + 8 + 11
const BASE_WALL_CABINET_HEIGHT = 60;
const BASE_WALL_CABINET_HOURS = 1.5;

const DRAWER_PRICE = 115;
const BASE_WIDTH_STEP_PERCENT = 0.15;    // 15 % par 20 cm
const WALL_HEIGHT_STEP_PERCENT = 0.23;   // 23 % par 20 cm

const CORNER_BASE_WIDTH_EQUIV = 120;     // bas angle = bas 120 cm

const PANTRY_MATERIAL = 115;
const PANTRY_HOURS = 0.5;

const TALL_BASE_MATERIAL = 155;
const TALL_BASE_HOURS = 3;

const TALL_SHELVES_EXTRA = 25;
const TALL_DRAWERS_EXTRA = 500;

// options meuble d'angle bas
const CORNER_SHELF_PRICE = 10;
const CORNER_KIDNEY_PRICE = 243;

const DAILY_RATE = 500;
const HOURS_PER_DAY = 8;
const HOURLY_RATE = DAILY_RATE / HOURS_PER_DAY; // 62.5 €/h

export type CabinetCategory = 'base' | 'wall' | 'tall';

export type CabinetKind =
  | 'base-standard'
  | 'base-corner'
  | 'base-pantry'
  | 'wall-standard'
  | 'wall-deep'
  | 'wall-niche'
  | 'tall-standard-fridge'
  | 'tall-standard-shelves'
  | 'tall-standard-drawers';

export interface CabinetUnitInput {
  category: CabinetCategory;
  kind: CabinetKind;
  widthCm?: number;
  heightCm?: number;
  drawerCount?: number;
  cornerOption?: 'shelf' | 'kidney'; // étagère / haricot
}

export interface CabinetUnitPrice {
  materialPrice: number;
  laborHours: number;
  laborCost: number;
  totalPrice: number;
}

function applySteps(
  basePrice: number,
  baseValue: number,
  actualValue: number | undefined,
  stepSize: number,
  percentPerStep: number
): number {
  if (!actualValue) return basePrice;
  const steps = (actualValue - baseValue) / stepSize;
  return basePrice * (1 + percentPerStep * steps);
}

export function computeCabinetUnitPrice(input: CabinetUnitInput): CabinetUnitPrice {
  let material = 0;
  let hours = 0;

  // --- Meubles bas ---
  if (input.category === 'base') {
    if (input.kind === 'base-standard') {
      let basePrice = BASE_BASE_CABINET_MATERIAL;

      basePrice = applySteps(
        basePrice,
        BASE_BASE_CABINET_WIDTH,
        input.widthCm,
        20,
        BASE_WIDTH_STEP_PERCENT
      );
      material = basePrice;

      if (input.drawerCount && input.drawerCount > 0) {
        material += input.drawerCount * DRAWER_PRICE;
      }

      hours = BASE_BASE_CABINET_HOURS;
    }

    if (input.kind === 'base-corner') {
      let basePrice = BASE_BASE_CABINET_MATERIAL;
      basePrice = applySteps(
        basePrice,
        BASE_BASE_CABINET_WIDTH,
        CORNER_BASE_WIDTH_EQUIV,
        20,
        BASE_WIDTH_STEP_PERCENT
      );
      material = basePrice;

      if (input.cornerOption === 'shelf') {
        material += CORNER_SHELF_PRICE;
      } else if (input.cornerOption === 'kidney') {
        material += CORNER_KIDNEY_PRICE;
      }

      hours = BASE_BASE_CABINET_HOURS;
    }

    if (input.kind === 'base-pantry') {
      material = PANTRY_MATERIAL;
      hours = PANTRY_HOURS;
    }
  }

  // --- Colonnes ---
  if (input.category === 'tall') {
    material = TALL_BASE_MATERIAL;
    hours = TALL_BASE_HOURS;

    if (input.kind === 'tall-standard-fridge') {
      // +0 €
    }
    if (input.kind === 'tall-standard-shelves') {
      material += TALL_SHELVES_EXTRA;
    }
    if (input.kind === 'tall-standard-drawers') {
      material += TALL_DRAWERS_EXTRA;
    }
  }

  // --- Meubles hauts ---
  if (input.category === 'wall') {
    let basePrice = BASE_WALL_CABINET_MATERIAL;

    basePrice = applySteps(
      basePrice,
      BASE_WALL_CABINET_HEIGHT,
      input.heightCm,
      20,
      WALL_HEIGHT_STEP_PERCENT
    );
    material = basePrice;

    if (input.kind === 'wall-niche') {
      material = material * 1.25;
    }

    if (input.kind === 'wall-deep') {
      material = material * 1.2;
    }

    hours = BASE_WALL_CABINET_HOURS;
  }

  const laborCost = hours * HOURLY_RATE;
  const totalPrice = material + laborCost;

  return {
    materialPrice: material,
    laborHours: hours,
    laborCost,
    totalPrice,
  };
}

// ========= AGRÉGATION POUR KitchenItemsBuilder =========

export interface CabinetItemLike {
  id?: string;                            // ← ajouté
  category?: 'base' | 'wall' | 'tall' | 'worktop';
  itemType?: string;
  widthCm?: number;
  heightCm?: number;
  frontConfig?: string;
  drawerCount?: number;
  cornerOption?: 'shelf' | 'kidney';
}

/**
 * Calcule le détail par meuble + totaux, pose, marge et TVA.
 */
export function computeFromBuilderItems(items: CabinetItemLike[]) {
  let totalMaterial = 0;
  let totalHours = 0;
  let totalLaborCost = 0;
  let totalPrice = 0; // HT des meubles (matière + atelier, sans marge)

  const detailed = items.map((item) => {
    if (!item.category || !item.itemType) {
      return { item, price: null as CabinetUnitPrice | null };
    }

    if (item.category === 'worktop') {
      return { item, price: null as CabinetUnitPrice | null };
    }

    const category = item.category as CabinetCategory;
    let kind: CabinetKind;

    switch (item.itemType) {
      case 'base-standard':
        kind = 'base-standard';
        break;
      case 'base-corner':
        kind = 'base-corner';
        break;
      case 'base-pantry':
        kind = 'base-pantry';
        break;
      case 'wall-standard':
        kind = 'wall-standard';
        break;
      case 'wall-deep':
        kind = 'wall-deep';
        break;
      case 'wall-niche':
        kind = 'wall-niche';
        break;
      case 'tall-standard':
        if (item.frontConfig === 'fridge') {
          kind = 'tall-standard-fridge';
        } else if (item.frontConfig === 'shelves') {
          kind = 'tall-standard-shelves';
        } else if (item.frontConfig === 'tall-drawers') {
          kind = 'tall-standard-drawers';
        } else {
          kind = 'tall-standard-fridge';
        }
        break;
      default:
        return { item, price: null as CabinetUnitPrice | null };
    }

    const unitInput: CabinetUnitInput = {
      category,
      kind,
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      drawerCount: item.drawerCount,
      cornerOption: item.cornerOption,
    };

    const price = computeCabinetUnitPrice(unitInput);
    totalMaterial += price.materialPrice;
    totalHours += price.laborHours;
    totalLaborCost += price.laborCost;
    totalPrice += price.totalPrice;

    return { item, price };
  });

  // --- Pose de la cuisine (0,125 jour / caisson, min 1 jour si au moins 1 caisson) ---
  const cabinetsCount = detailed.filter(
    (row) =>
      row.price &&
      row.item.category &&
      row.item.category !== 'worktop'
  ).length;

  const installationDays =
    cabinetsCount > 0 ? Math.max(1, cabinetsCount * 0.125) : 0;
  const installationCost = installationDays * DAILY_RATE;

  // --- Marge commerciale et TVA ---
  const marginRate = 0.25;
  const vatRate = 0.20;

  const baseTotalHT = totalPrice + installationCost;

  const marginAmount = baseTotalHT * marginRate;
  const totalWithMargin = baseTotalHT + marginAmount;
  const vatAmount = totalWithMargin * vatRate;
  const totalTTC = totalWithMargin + vatAmount;

  return {
    detailed,
    totals: {
      material: totalMaterial,
      laborHours: totalHours,
      laborCost: totalLaborCost,
      installationDays,
      installationCost,
      totalHTMeubles: totalPrice,
      marginRate,
      marginAmount,
      totalHTAvecMarge: totalWithMargin,
      vatRate,
      vatAmount,
      totalTTC,
    },
  };
}