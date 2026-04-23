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
    custom: false,
    installation: true,
    appliances: true,
  };
}