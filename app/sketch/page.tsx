// app/sketch/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type LayoutType = 'line' | 'l-shape' | 'u-shape';

type ApiResponse = {
  input: {
    roomLength: number;
    range: 'entry' | 'mid' | 'premium';
    hasIsland: boolean;
    custom: boolean;
    installation: boolean;
    appliances: boolean;
  };
  result: {
    linearPrice?: number;
    cabinetsPrice?: number;
    interiorsPrice?: number;
    shelvesPrice?: number;
    worktopPrice?: number;
    backsplashPrice?: number;
    finishingPrice?: number;
    hardwarePrice?: number;
    appliancesPrice?: number;
    servicesPrice?: number;
    materialSubtotal?: number;
    optionsTotal?: number;
    margin?: number;
    totalPrice?: number;
  };
};

export default function SketchPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [mainLength, setMainLength] = useState<string>('');
  const [layoutType, setLayoutType] = useState<LayoutType>('line');
  const [hasIsland, setHasIsland] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Merci d’ajouter une photo du croquis.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (mainLength) formData.append('mainLength', mainLength);
      formData.append('layoutType', layoutType);
      formData.append('hasIsland', hasIsland ? 'true' : 'false');

      const res = await fetch('/api/sketch-estimate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Erreur serveur');
      }

      const data = (await res.json()) as ApiResponse;
      setApiResult(data);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  function handleUseInConfigurator() {
    if (!apiResult || !apiResult.input) return;

    const params = new URLSearchParams({
      roomLength: String(apiResult.input.roomLength ?? ''),
      range: apiResult.input.range ?? 'mid',
      hasIsland: String(apiResult.input.hasIsland ?? false),
      fromSketch: '1',
    });

    router.push('/?' + params.toString());
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900/60 p-8 shadow-xl border border-slate-800 space-y-6">
        <h1 className="text-2xl font-semibold">Devis à partir d’un croquis</h1>
        <p className="text-slate-300 text-sm">
          Téléverse un croquis à main levée avec les côtes, indique quelques informations,
          et nous pré-remplissons le devis.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Croquis (photo / scan)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target?.files?.[0] || null;
                setFile(f);
              }}
              className="block w-full text-sm text-slate-200
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-slate-800 file:text-slate-100
                         hover:file:bg-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Longueur principale (mètres) – optionnel
            </label>
            <input
              type="text"
              value={mainLength}
              onChange={(e) => setMainLength(e.target.value)}
              placeholder="ex : 3.60"
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Type de plan</label>
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                onClick={() => setLayoutType('line')}
                className={`px-3 py-2 rounded-md border ${
                  layoutType === 'line'
                    ? 'bg-sky-600 border-sky-500'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                En ligne
              </button>
              <button
                type="button"
                onClick={() => setLayoutType('l-shape')}
                className={`px-3 py-2 rounded-md border ${
                  layoutType === 'l-shape'
                    ? 'bg-sky-600 border-sky-500'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                En L
              </button>
              <button
                type="button"
                onClick={() => setLayoutType('u-shape')}
                className={`px-3 py-2 rounded-md border ${
                  layoutType === 'u-shape'
                    ? 'bg-sky-600 border-sky-500'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                En U
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="hasIsland"
              type="checkbox"
              checked={hasIsland}
              onChange={(e) => setHasIsland(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800"
            />
            <label htmlFor="hasIsland" className="text-sm">
              Présence d’un îlot central
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-sky-600 hover:bg-sky-500 transition text-white py-3 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'Analyse du croquis…' : 'Estimer le devis depuis le croquis'}
          </button>
        </form>

        {apiResult && apiResult.input && apiResult.result && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm space-y-2">
            <h2 className="text-base font-semibold mb-2">
              Résultat estimé
            </h2>
            <p className="text-slate-300">
              Longueur estimée : {apiResult.input.roomLength.toFixed(2)} m
              {' • '}
              Gamme : {apiResult.input.range}
              {' • '}
              Îlot : {apiResult.input.hasIsland ? 'Oui' : 'Non'}
            </p>
            {typeof apiResult.result.totalPrice === 'number' && (
              <p className="text-slate-300">
                Total estimé :{' '}
                {apiResult.result.totalPrice.toLocaleString('fr-FR')} € TTC
              </p>
            )}
            <button
              onClick={handleUseInConfigurator}
              className="mt-3 inline-flex items-center rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold"
            >
              Utiliser ces valeurs dans le configurateur
            </button>
          </div>
        )}
      </div>
    </main>
  );
}