// lib/sketch-mapping.ts
import { KitchenQuoteInput } from '@/lib/pricing-advanced';

export type SketchMetadata = {
  mainLength?: number;
  layoutType?: 'line' | 'l-shape' | 'u-shape';
  hasIsland?: boolean;
};

export function estimateFromSketchMock(meta: SketchMetadata): KitchenQuoteInput {
  const baseLength = meta.mainLength && meta.mainLength > 0 ? meta.mainLength : 4;

  let totalLength = baseLength;

  if (meta.layoutType === 'l-shape') {
    totalLength = baseLength * 1.4;
  } else if (meta.layoutType === 'u-shape') {
    totalLength = baseLength * 1.8;
  }

  if (meta.hasIsland) {
    totalLength += 2;
  }

  let range: KitchenQuoteInput['range'] = 'mid';
  if (totalLength < 4) range = 'entry';
  if (totalLength > 6) range = 'premium';

  return {
    roomLength: Number(totalLength.toFixed(2)),
    range,
    hasIsland: meta.hasIsland ?? false,

    // valeurs par défaut simples, pour satisfaire le type
    baseCabinets: 6,
    wallCabinets: 4,
    tallCabinets: 0,

    drawers: 4,
    pullouts: 0,

    worktopLength: Number(totalLength.toFixed(2)),
    worktopDepth: 0.65,
    backsplashLength: Number(totalLength.toFixed(2)),
    backsplashHeight: 0.5,

    handles: 10,
    ledStrips: meta.hasIsland ? 2 : 1,

    appliancesCount: 0,

    installation: true,
    delivery: false,
    removal: false,

    customWork: false,
  };
}