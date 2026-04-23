// lib/pricing-advanced.ts

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
  servicesPrice: number;
  materialSubtotal: number;
  optionsTotal: number;
  marginAmount: number;
  totalPrice: number;
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

  // Prix unitaires de base (à adapter à tes vraies valeurs)
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

  const installationBase = 700;
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

  // Finitions “générales” (ex : plinthes, fileurs, joues) – ici on met un forfait
  const finishingPrice = 150 * rangeFactor;

  // Électros
  const appliancesPrice = input.appliancesCount * applianceUnit;

  // Services
  let servicesPrice = 0;
  if (input.installation) servicesPrice += installationBase;
  if (input.delivery) servicesPrice += deliveryBase;
  if (input.removal) servicesPrice += removalBase;
  if (input.customWork) servicesPrice += customWorkBase;

  const materialSubtotal =
    cabinetsPrice +
    interiorsPrice +
    worktopPrice +
    backsplashPrice +
    finishingPrice +
    hardwarePrice +
    appliancesPrice;

  const optionsTotal = servicesPrice;

  // Marge – par exemple 20% sur le total matériel + options
  const marginRate = 0.2;
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
    materialSubtotal,
    optionsTotal,
    marginAmount,
    totalPrice,
  };
}