// app/page.tsx
import { KitchenItemsBuilder } from "@/components/KitchenItemsBuilder";

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="text-3xl font-semibold mb-4">
        Super outil des Cuisines de Vincent
      </h1>

      {/* Nouveau bloc : construction des éléments */}
      <KitchenItemsBuilder />

      {/* Plus tard : bouton “Calculer le devis” qui lit le tableau `items` */}
    </main>
  );
}