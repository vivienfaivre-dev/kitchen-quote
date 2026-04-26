// app/page.tsx
import { KitchenItemsBuilder } from "@/components/KitchenItemsBuilder";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Super Outil des Cuisines de Vincent
        </h1>

        <KitchenItemsBuilder />
      </div>
    </main>
  );
}