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

  // === AJOUT : ligne unique Plan de travail avec longueur calculée ===
  if (worktopTotalHT > 0 && totalBaseLengthM > 0) {
    const designationPlan = `Plan de travail ${totalBaseLengthM.toFixed(2)} m`;

    rowsMeubles.push([
      designationPlan,
      1, // une ligne globale
      parseFloat(worktopTotalHT.toFixed(2)), // prix HT global
    ]);
  }

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