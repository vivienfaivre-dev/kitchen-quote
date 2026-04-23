// app/api/sketch-estimate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { estimateFromSketchMock } from '@/lib/sketch-mapping';
import { computeKitchenQuote } from '@/lib/pricing-advanced';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const sketchFile = formData.get('file');
    if (!sketchFile || !(sketchFile instanceof File)) {
      return NextResponse.json(
        { error: 'Croquis manquant (file)' },
        { status: 400 }
      );
    }

    const mainLengthStr = formData.get('mainLength') as string | null;
    const layoutType = formData.get('layoutType') as
      | 'line'
      | 'l-shape'
      | 'u-shape'
      | null;
    const hasIslandStr = formData.get('hasIsland') as string | null;

    const mainLength = mainLengthStr ? Number(mainLengthStr.replace(',', '.')) : undefined;
    const hasIsland = hasIslandStr === 'true';

    const sketchMeta = {
      mainLength,
      layoutType: layoutType ?? undefined,
      hasIsland,
    };

    const quoteInput = estimateFromSketchMock(sketchMeta);
    const quote = computeKitchenQuote(quoteInput);

    return NextResponse.json({
      input: quoteInput,
      result: quote,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du croquis' },
      { status: 500 }
    );
  }
}