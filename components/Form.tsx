// components/Form.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  computeKitchenQuote,
  KitchenQuoteInput,
  KitchenQuoteBreakdown,
} from '@/lib/pricing-advanced';

export default function Form() {
  const searchParams = useSearchParams();

  const fromSketch = searchParams.get('fromSketch') === '1';
  const initialRoomLength = searchParams.get('roomLength') || '';
  const initialRange =
    (searchParams.get('range') as KitchenQuoteInput['range']) || 'mid';
  const initialHasIsland = searchParams.get('hasIsland') === 'true';

  const [clientName, setClientName] = useState('');
  const [roomLength, setRoomLength] = useState<string>('');
  const [range, setRange] =
    useState<KitchenQuoteInput['range']>('mid');
  const [hasIsland, setHasIsland] = useState(false);

  // Multi-step
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 2 : meubles
  const [baseCabinets, setBaseCabinets] = useState<number>(6);
  const [wallCabinets, setWallCabinets] = useState<number>(4);
  const [tallCabinets, setTallCabinets] = useState<number>(0);

  // Step 3 : intérieurs & finitions
  const [drawers, setDrawers] = useState<number>(4);
  const [pullouts, setPullouts] = useState<number>(0);
  const [handles, setHandles] = useState<number>(10);
  const [ledStrips, setLedStrips] = useState<number>(1);

  // Step 4 : services
  const [customLevel, setCustomLevel] = useState<0 | 1 | 2>(0);
  const [installation, setInstallation] = useState(true);
  const [oldKitchenRemoval, setOldKitchenRemoval] = useState(false);
  const [delivery, setDelivery] = useState(false);

  const [quote, setQuote] = useState<KitchenQuoteBreakdown | null>(null);

  useEffect(() => {
    // pré-remplissage depuis /sketch
    setRoomLength(initialRoomLength);
    setRange(initialRange);
    setHasIsland(initialHasIsland);
  }, [initialRoomLength, initialRange, initialHasIsland]);

  function goToNextStep() {
    setCurrentStep((prev) => (prev < 4 ? (prev + 1) as any : prev));
  }

  function goToPrevStep() {
    setCurrentStep((prev) => (prev > 1 ? (prev - 1) as any : prev));
  }

  function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roomLength) return;

    const lengthNum = Number(roomLength.replace(',', '.')) || 0;

    const input: KitchenQuoteInput = {
      // Contexte global
      roomLength: lengthNum,
      hasIsland,
      range,

      // Meubles (utilise les valeurs choisies en Step 2)
      baseCabinets,
      wallCabinets,
      tallCabinets,

      // Intérieurs / tiroirs (Step 3)
      drawers,
      pullouts,

      // Plans de travail & crédences (déduits de la longueur)
      worktopLength: lengthNum,
      worktopDepth: 0.65,
      backsplashLength: lengthNum,
      backsplashHeight: 0.5,

      // Finitions & quincaillerie (Step 3)
      handles,
      ledStrips,

      // Électroménager (placeholder pour l’instant)
      appliancesCount: 0,

      // Services (Step 4)
      installation,
      delivery,
      removal: oldKitchenRemoval,

      // Divers
      customWork: customLevel > 0,
    };

    const result = computeKitchenQuote(input);
    setQuote(result);
    setCurrentStep(4);
  }

  // Helpers pour les champs numériques
  function parseNumber(value: string, fallback = 0) {
    const n = Number(value.replace(',', '.'));
    return Number.isNaN(n) ? fallback : n;
  }

  return (
    <div className="space-y-6">
      {fromSketch && (
        <p className="text-xs text-emerald-400">
          Valeurs pré-remplies à partir du croquis.
        </p>
      )}

      {/* Indicateur de steps */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <div className={currentStep >= 1 ? 'text-emerald-400 font-medium' : ''}>
          1. Dimensions & gamme
        </div>
        <div className={currentStep >= 2 ? 'text-emerald-400 font-medium' : ''}>
          2. Meubles
        </div>
        <div className={currentStep >= 3 ? 'text-emerald-400 font-medium' : ''}>
          3. Intérieurs & finitions
        </div>
        <div className={currentStep >= 4 ? 'text-emerald-400 font-medium' : ''}>
          4. Services & total
        </div>
      </div>

      <form
        onSubmit={currentStep === 4 ? handleFinalSubmit : (e) => e.preventDefault()}
        className="space-y-4"
      >
        {/* STEP 1 */}
        {currentStep === 1 && (
          <>
            <div>
              <label className="block text-sm mb-1">Nom du client</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex : Mme Dupont"
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Longueur de cuisine (mètres)
              </label>
              <input
                type="text"
                value={roomLength}
                onChange={(e) => setRoomLength(e.target.value)}
                placeholder="Ex : 4.20"
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Gamme</label>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setRange('entry')}
                  className={`px-3 py-2 rounded-md border ${
                    range === 'entry'
                      ? 'bg-sky-600 border-sky-500'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  Entrée de gamme
                </button>
                <button
                  type="button"
                  onClick={() => setRange('mid')}
                  className={`px-3 py-2 rounded-md border ${
                    range === 'mid'
                      ? 'bg-sky-600 border-sky-500'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  Milieu de gamme
                </button>
                <button
                  type="button"
                  onClick={() => setRange('premium')}
                  className={`px-3 py-2 rounded-md border ${
                    range === 'premium'
                      ? 'bg-sky-600 border-sky-500'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  Premium
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hasIsland}
                onChange={(e) => setHasIsland(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800"
              />
              <span>Îlot central</span>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <>
            <div>
              <label className="block text-sm mb-1">
                Meubles bas (nombre de caissons)
              </label>
              <input
                type="number"
                min={0}
                value={baseCabinets}
                onChange={(e) => setBaseCabinets(parseNumber(e.target.value, 0))}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Meubles hauts (nombre de caissons)
              </label>
              <input
                type="number"
                min={0}
                value={wallCabinets}
                onChange={(e) => setWallCabinets(parseNumber(e.target.value, 0))}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Colonnes (nombre de caissons)
              </label>
              <input
                type="number"
                min={0}
                value={tallCabinets}
                onChange={(e) => setTallCabinets(parseNumber(e.target.value, 0))}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <>
            <div>
              <label className="block text-sm mb-1">
                Nombre de tiroirs
              </label>
              <input
                type="number"
                min={0}
                value={drawers}
                onChange={(e) => setDrawers(parseNumber(e.target.value, 0))}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Colonnes / meubles à sortie totale
              </label>
              <input
                type="number"
                min={0}
                value={pullouts}
                onChange={(e) => setPullouts(parseNumber(e.target.value, 0))}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Nombre de poignées
              </label>
              <input
                type="number"
                min={0}
                value={handles}
                onChange={(e) => setHandles(parseNumber(e.target.value, 0))}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Bandes LED (nombre)
              </label>
              <input
                type="number"
                min={0}
                value={ledStrips}
                onChange={(e) => setLedStrips(parseNumber(e.target.value, 0))}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2">
                <span>Sur-mesure</span>
                <select
                  value={customLevel}
                  onChange={(e) =>
                    setCustomLevel(Number(e.target.value) as 0 | 1 | 2)
                  }
                  className="rounded-md bg-slate-800 border border-slate-700 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value={0}>Aucun</option>
                  <option value={1}>Quelques éléments</option>
                  <option value={2}>Sur-mesure fort</option>
                </select>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={installation}
                  onChange={(e) => setInstallation(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800"
                />
                Pose incluse
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={oldKitchenRemoval}
                  onChange={(e) => setOldKitchenRemoval(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800"
                />
                Dépose ancienne cuisine
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={delivery}
                  onChange={(e) => setDelivery(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800"
                />
                Livraison
              </label>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={goToPrevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-md border border-slate-700 text-sm disabled:opacity-40"
          >
            Précédent
          </button>

          {currentStep < 4 && (
            <button
              type="button"
              onClick={goToNextStep}
              className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
            >
              Suivant
            </button>
          )}

          {currentStep === 4 && (
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
            >
              Calculer le devis
            </button>
          )}
        </div>
      </form>

      {quote && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm space-y-2">
          <h2 className="text-base font-semibold mb-1">
            Résultat du devis
          </h2>

          <p className="text-slate-300">
            Meubles : {quote.cabinetsPrice.toLocaleString('fr-FR')} € HT
          </p>
          <p className="text-slate-300">
            Intérieurs / tiroirs : {quote.interiorsPrice.toLocaleString('fr-FR')} € HT
          </p>
          <p className="text-slate-300">
            Plans de travail : {quote.worktopPrice.toLocaleString('fr-FR')} € HT
          </p>
          <p className="text-slate-300">
            Crédences : {quote.backsplashPrice.toLocaleString('fr-FR')} € HT
          </p>
          <p className="text-slate-300">
            Finitions : {quote.finishingPrice.toLocaleString('fr-FR')} € HT
          </p>
          <p className="text-slate-300">
            Quincaillerie / LED : {quote.hardwarePrice.toLocaleString('fr-FR')} € HT
          </p>
          <p className="text-slate-300">
            Électroménager : {quote.appliancesPrice.toLocaleString('fr-FR')} € HT
          </p>

          <p className="text-slate-300">
            Temps de fabrication estimé :{' '}
            {quote.fabricationHours.toFixed(1)} h
            {' '}≈ {(quote.fabricationHours / 8).toFixed(2)} j
          </p>
          <p className="text-slate-300">
            Coût de fabrication (atelier) :{' '}
            {quote.fabricationCost.toLocaleString('fr-FR')} € HT
          </p>

          <p className="text-slate-300">
            Matériel (hors services) :{' '}
            {quote.materialSubtotal.toLocaleString('fr-FR')} € HT
          </p>
          <p className="text-slate-300">
            Services : {quote.servicesPrice.toLocaleString('fr-FR')} € HT
          </p>
          <p className="text-slate-300">
            Marge : {quote.marginAmount.toLocaleString('fr-FR')} €
          </p>
          <p className="text-slate-100 font-semibold">
            Total TTC estimé : {quote.totalPrice.toLocaleString('fr-FR')} €
          </p>
        </div>
      )}
    </div>
  );
}