import React, { useState, useMemo } from "react";

/* ------------------------------------------------------------------
   Datengrundlage — kuratiert, offline.
   Orientiert an den gaengigen Schweizer Empfehlungen (BLV-Merkblatt
   "Ernaehrung in der Schwangerschaft"). Vor produktivem Einsatz von
   Hebamme oder Gynaekologin gegenlesen lassen.
   status: "ok" | "bedingt" | "meiden" | "unklar"
   ------------------------------------------------------------------ */

const DATEN = [
  {
    name: "Weichkaese mit Weissschimmel",
    syn: ["camembert", "brie", "weichkaese", "weisschimmel", "chaource", "tomme"],
    frage: "Aus welcher Milch?",
    varianten: [
      { label: "Pasteurisiert", status: "bedingt", text: "Rinde grosszuegig wegschneiden. Angebrochene Packungen nur kurz und gut gekuehlt lagern." },
      { label: "Rohmilch", status: "meiden", text: "Weichkaese aus Rohmilch ist der klassische Listerien-Traeger. Auch mit entfernter Rinde nicht empfohlen." },
      { label: "Durcherhitzt (ueberbacken)", status: "ok", text: "Ueber 70 Grad durcherhitzt sind Listerien abgetoetet." },
    ],
    alternativen: ["Hartkaese wie Gruyere oder Sbrinz", "Frischkaese aus pasteurisierter Milch", "Mozzarella aus pasteurisierter Milch"],
  },
  {
    name: "Blauschimmelkaese",
    syn: ["gorgonzola", "roquefort", "blauschimmel", "bleu"],
    varianten: [
      { label: "Pasteurisiert", status: "bedingt", text: "Nur frisch angeschnitten und gut gekuehlt. Viele Sorten sind Rohmilchkaese — Etikette pruefen." },
      { label: "Rohmilch", status: "meiden", text: "Roquefort ist immer Rohmilchkaese." },
      { label: "Durcherhitzt", status: "ok", text: "In der Sauce mitgekocht unbedenklich." },
    ],
    alternativen: ["Blauschimmel in einer gekochten Sauce", "Kraeuterfrischkaese"],
  },
  {
    name: "Feta",
    syn: ["feta", "schafskaese", "salzlakenkaese"],
    varianten: [
      { label: "Pasteurisiert", status: "ok", text: "Feta aus pasteurisierter Milch ist unbedenklich. Bei offener Ware aus der Theke gilt: Etikette pruefen." },
      { label: "Rohmilch / unklar", status: "meiden", text: "Ohne Angabe auf der Verpackung besser stehen lassen." },
    ],
    alternativen: ["Abgepackter Feta mit Pasteurisierungs-Hinweis", "Hartkaese"],
  },
  {
    name: "Mozzarella",
    syn: ["mozzarella", "burrata", "bueffelmozzarella"],
    varianten: [
      { label: "Pasteurisiert", status: "ok", text: "Frisch geoeffnet essen, Rest gut gekuehlt und rasch aufbrauchen." },
      { label: "Rohmilch (oft Bueffelmozzarella, Burrata)", status: "meiden", text: "Burrata und Bueffelmozzarella sind haeufig aus Rohmilch." },
    ],
    alternativen: ["Abgepackter Kuhmilch-Mozzarella", "Ricotta aus pasteurisierter Milch"],
  },
  {
    name: "Hartkaese",
    syn: ["hartkaese", "gruyere", "greyerzer", "sbrinz", "parmesan", "emmentaler", "appenzeller", "bergkaese", "halbhartkaese"],
    status: "ok",
    text: "Hartkaese und Halbhartkaese sind auch aus Rohmilch unbedenklich: der niedrige Wassergehalt und die lange Reifung lassen Listerien nicht wachsen. Rinde bei Rohmilchkaese trotzdem wegschneiden.",
    alternativen: [],
  },
  {
    name: "Raclette und Fondue",
    syn: ["raclette", "fondue", "kaesefondue"],
    status: "ok",
    text: "Beides wird geschmolzen und damit ausreichend erhitzt. Beim Raclette darauf achten, dass der Kaese wirklich durchgehend heiss ist, nicht nur oben angebraeunt.",
    alternativen: [],
  },
  {
    name: "Frischkaese und Huettenkaese",
    syn: ["frischkaese", "huettenkaese", "cottage", "quark", "ricotta", "philadelphia"],
    status: "ok",
    text: "Aus pasteurisierter Milch unbedenklich. Nach dem Oeffnen gekuehlt lagern und innert weniger Tage aufbrauchen.",
    alternativen: [],
  },
  {
    name: "Lachs",
    syn: ["lachs", "salmon"],
    frage: "Wie zubereitet?",
    varianten: [
      { label: "Gegart", status: "ok", text: "Durchgegarter Lachs ist unbedenklich und liefert wertvolle Omega-3-Fettsaeuren. Ein bis zwei Portionen fetter Fisch pro Woche werden empfohlen." },
      { label: "Geraeuchert", status: "meiden", text: "Kaltgeraeucherter Lachs wird nicht erhitzt und ist ein bekanntes Listerien-Risiko." },
      { label: "Roh (Sushi, Sashimi, Graved)", status: "meiden", text: "Roher Fisch: Risiko fuer Listerien und Parasiten." },
    ],
    alternativen: ["Gebratenes oder pochiertes Lachsfilet", "Lachs aus der Dose", "Geraeucherter Lachs kurz in der Pfanne durcherhitzt"],
  },
  {
    name: "Thunfisch",
    syn: ["thunfisch", "tuna", "thon"],
    status: "bedingt",
    text: "Thunfisch reichert Quecksilber an. Empfohlen wird maximal eine Portion pro Woche, und dann gegart oder aus der Dose. Roher Thunfisch faellt zusaetzlich unter die Sushi-Regel.",
    alternativen: ["Lachs, Forelle oder Felchen (gegart)", "Sardinen und Makrelen aus der Dose"],
  },
  {
    name: "Schwertfisch, Hai, Marlin",
    syn: ["schwertfisch", "hai", "marlin", "aal", "hecht", "raubfisch"],
    status: "meiden",
    text: "Grosse Raubfische am Ende der Nahrungskette haben die hoechsten Quecksilberwerte. In der Schwangerschaft ganz weglassen.",
    alternativen: ["Lachs", "Forelle", "Egli oder Felchen"],
  },
  {
    name: "Sushi",
    syn: ["sushi", "sashimi", "poke", "ceviche", "tatar vom fisch"],
    status: "meiden",
    text: "Roher Fisch ist wegen Listerien und Parasiten nicht empfohlen. Sushi mit gegarten oder vegetarischen Fuellungen ist dagegen in Ordnung — frisch zubereitet und rasch gegessen.",
    alternativen: ["Maki mit Gurke, Avocado oder Tamago", "Ebi-Sushi (die Garnele ist gekocht)", "Gegrillter Aal ist trotz Garung wegen Schadstoffen keine gute Wahl"],
  },
  {
    name: "Meeresfruechte",
    syn: ["austern", "muscheln", "garnelen", "crevetten", "meeresfruechte", "shrimps", "jakobsmuscheln"],
    frage: "Wie zubereitet?",
    varianten: [
      { label: "Durchgegart", status: "ok", text: "Gekochte Muscheln und Crevetten sind unbedenklich. Muscheln, die sich beim Kochen nicht oeffnen, wegwerfen." },
      { label: "Roh (Austern, Sashimi)", status: "meiden", text: "Rohe Schalentiere gehoeren zu den riskantesten Lebensmitteln ueberhaupt — Noroviren, Vibrionen, Listerien." },
    ],
    alternativen: ["Gebratene Crevetten", "Muscheln in Weissweinsud (gut durchgekocht)"],
  },
  {
    name: "Rohwurst und Trockenfleisch",
    syn: ["salami", "rohschinken", "trockenfleisch", "buendnerfleisch", "prosciutto", "parmaschinken", "landjaeger", "cervelat roh", "mettwurst", "chorizo"],
    frage: "Wie servierst du es?",
    varianten: [
      { label: "Durcherhitzt (Pizza, Pfanne)", status: "ok", text: "Auf der frisch gebackenen Pizza oder kurz angebraten unbedenklich." },
      { label: "Kalt, wie gekauft", status: "meiden", text: "Luftgetrocknetes, nicht erhitztes Fleisch kann Toxoplasmose-Erreger enthalten." },
      { label: "Vorher 3 Tage tiefgefroren", status: "bedingt", text: "Tiefkuehlen bei minus 18 Grad ueber mehrere Tage inaktiviert Toxoplasmen. Praktikabel, aber kein Ersatz fuer Erhitzen bei Listerien." },
    ],
    alternativen: ["Gekochter Schinken", "Fleischkaese", "Cervelat (gebruht, also gegart)"],
  },
  {
    name: "Tatar und rohes Fleisch",
    syn: ["tatar", "tartar", "carpaccio", "mett", "hackfleisch roh", "rohes fleisch"],
    status: "meiden",
    text: "Rohes Fleisch ist die haeufigste Toxoplasmose-Quelle. Wenn sie noch keine Toxoplasmose durchgemacht hat — was die meisten nicht haben — ist das Risiko real.",
    alternativen: ["Kurz gebratenes Rindsfilet, aber durchgegart", "Vitello tonnato mit durchgegartem Kalbfleisch"],
  },
  {
    name: "Steak",
    syn: ["steak", "entrecote", "filet", "roastbeef", "rindfleisch", "burger"],
    frage: "Wie durch?",
    varianten: [
      { label: "Durchgebraten (well done)", status: "ok", text: "Kerntemperatur ueber 70 Grad, kein rosa Saft mehr — unbedenklich." },
      { label: "Rosa oder blutig", status: "meiden", text: "Innen rosa heisst: nicht auf sichere Kerntemperatur erhitzt." },
    ],
    alternativen: ["Schmorgerichte wie Ragout oder Braten sind ohnehin durchgegart"],
  },
  {
    name: "Gefluegel",
    syn: ["poulet", "haehnchen", "huhn", "gefluegel", "pouletbrust", "truthahn"],
    status: "bedingt",
    text: "Immer vollstaendig durchgaren (Salmonellen). Beim Rohzustand auf getrennte Schneidebretter und gruendliches Haendewaschen achten.",
    alternativen: [],
  },
  {
    name: "Leber und Leberprodukte",
    syn: ["leber", "leberwurst", "leberpastete", "foie gras", "kalbsleber"],
    status: "meiden",
    trimesterHinweis: 1,
    text: "Leber enthaelt sehr hohe Mengen Vitamin A (Retinol). In hoher Dosis wirkt es fruchtschaedigend — besonders relevant in den ersten Wochen, wenn die Organe angelegt werden. Leberwurst und Leberpastete sind zusaetzlich oft nicht durcherhitzt.",
    alternativen: ["Fleischkaese oder gekochter Schinken aufs Brot", "Karotten decken Vitamin A als Beta-Carotin ab — das ist unproblematisch"],
  },
  {
    name: "Tiramisu und Mousse",
    syn: ["tiramisu", "mousse au chocolat", "rohes ei", "eischnee", "zabaione", "meringue italienne"],
    status: "meiden",
    text: "Klassisch mit rohem Ei zubereitet — Salmonellenrisiko. Industriell hergestellte Varianten verwenden pasteurisiertes Ei und sind unbedenklich; im Restaurant weiss man es meist nicht.",
    alternativen: ["Gekaufte Desserts mit pasteurisiertem Ei", "Panna cotta", "Tiramisu selber machen mit pasteurisiertem Ei"],
  },
  {
    name: "Mayonnaise",
    syn: ["mayonnaise", "mayo", "aioli", "sauce tartare", "hollandaise"],
    varianten: [
      { label: "Aus dem Laden", status: "ok", text: "Industrielle Mayonnaise wird mit pasteurisiertem Ei hergestellt." },
      { label: "Hausgemacht oder Restaurant", status: "meiden", text: "Frisch aufgeschlagen mit rohem Eigelb — Salmonellenrisiko." },
    ],
    alternativen: ["Gekaufte Mayonnaise", "Joghurt-Kraeuter-Dip"],
  },
  {
    name: "Eier",
    syn: ["ei", "eier", "spiegelei", "ruehrei", "weichgekochtes ei", "pochiertes ei", "omelette"],
    frage: "Wie zubereitet?",
    varianten: [
      { label: "Hart durchgegart", status: "ok", text: "Eigelb und Eiweiss fest — unbedenklich." },
      { label: "Weich, laufendes Eigelb", status: "meiden", text: "Spiegelei mit fluessigem Dotter, weiches Fruehstuecksei, pochiertes Ei: Salmonellen ueberleben." },
    ],
    alternativen: ["Ruehrei gut stocken lassen", "Hartgekochtes Ei"],
  },
  {
    name: "Kaffee",
    syn: ["kaffee", "espresso", "cappuccino", "koffein", "latte"],
    status: "bedingt",
    text: "Bis etwa 200 mg Koffein pro Tag gelten als unbedenklich — das sind rund zwei Tassen Filterkaffee oder drei Espresso. Cola, Schwarztee und Schokolade zaehlen mit.",
    alternativen: ["Entkoffeinierter Kaffee", "Getreidekaffee", "Rooibos"],
  },
  {
    name: "Schwarztee und Gruentee",
    syn: ["schwarztee", "gruentee", "matcha", "tee"],
    status: "bedingt",
    text: "Enthalten Koffein und zaehlen ins Tagesbudget. Gruentee hemmt zudem die Eisenaufnahme — nicht direkt zu den Mahlzeiten trinken.",
    alternativen: ["Rooibos", "Fruechtetee"],
  },
  {
    name: "Kraeutertee",
    syn: ["kraeutertee", "salbei", "ingwertee", "pfefferminztee", "himbeerblaetter", "brennnessel"],
    status: "bedingt",
    text: "Die meisten Sorten sind in normalen Mengen unproblematisch. Einzelne wirken jedoch wehenfoerdernd oder milchhemmend — Salbei, Himbeerblaetter und Zimtrinde erst gegen Ende der Schwangerschaft und nur nach Ruecksprache mit der Hebamme.",
    alternativen: ["Rooibos", "Fenchel", "Kamille", "Ingwer (auch gut gegen Uebelkeit)"],
  },
  {
    name: "Alkohol",
    syn: ["alkohol", "wein", "bier", "prosecco", "champagner", "schnaps", "cocktail", "aperol"],
    status: "meiden",
    text: "Es gibt keine bekannte unbedenkliche Menge. Alkohol geht direkt auf das Kind ueber.",
    alternativen: ["Alkoholfreier Sekt oder Bier", "Ingwer-Limette mit Sprudel", "Alkoholfreier Aperitif"],
  },
  {
    name: "Alkoholfreies Bier",
    syn: ["alkoholfreies bier", "alkoholfrei", "0.0"],
    status: "bedingt",
    text: "Als alkoholfrei gilt in der Schweiz bis 0,5 Volumenprozent Restalkohol. Produkte mit 0,0 Prozent sind die sichere Wahl.",
    alternativen: ["Getraenke mit ausgewiesenen 0,0 Prozent"],
  },
  {
    name: "Sprossen und Keimlinge",
    syn: ["sprossen", "keimlinge", "alfalfa", "mungbohnen", "kresse"],
    frage: "Roh oder gegart?",
    varianten: [
      { label: "Gegart", status: "ok", text: "Kurz mitgebraten oder blanchiert unbedenklich." },
      { label: "Roh", status: "meiden", text: "Die feucht-warme Keimung ist ideal fuer Salmonellen und E. coli. Waschen hilft nicht." },
    ],
    alternativen: ["Gebratene Sprossen im Wok", "Geriebene Karotte oder Gurke im Salat"],
  },
  {
    name: "Fertigsalat und Salatbuffet",
    syn: ["fertigsalat", "salatbuffet", "abgepackter salat", "vorgeschnitten", "salat", "smoothie bar"],
    status: "bedingt",
    text: "Vorgeschnittene Ware und offene Buffets stehen lange und werden viel angefasst. Zuhause selbst geruestet und gruendlich gewaschen ist Salat unbedenklich.",
    alternativen: ["Salat selber ruesten und waschen", "Gekochtes Gemuese als Beilage"],
  },
  {
    name: "Rohes Gemuese und Obst",
    syn: ["gemuese", "obst", "fruechte", "beeren", "erdbeeren", "tomaten", "gurke", "salat waschen"],
    status: "ok",
    text: "Gruendlich waschen oder schaelen — vor allem bei bodennahem Gemuese, wegen Erdresten und Toxoplasmose. Ansonsten sehr empfehlenswert.",
    alternativen: [],
  },
  {
    name: "Honig",
    syn: ["honig", "waldhonig", "bienenhonig"],
    status: "ok",
    text: "Fuer die Schwangere unbedenklich. Wichtig fuer spaeter: Saeuglinge duerfen im ersten Lebensjahr keinen Honig bekommen.",
    alternativen: [],
  },
  {
    name: "Ananas",
    syn: ["ananas", "papaya", "mango"],
    status: "ok",
    text: "Der Mythos, Ananas loese Wehen aus, haelt sich hartnaeckig. In normalen Essmengen gibt es dafuer keine Belege. Unreife Papaya ist die einzige begruendete Ausnahme.",
    alternativen: [],
  },
  {
    name: "Erdnuesse und Nuesse",
    syn: ["erdnuesse", "nuesse", "mandeln", "baumnuesse", "erdnussbutter"],
    status: "ok",
    text: "Die frueher empfohlene Vermeidung ist ueberholt. Nuesse in der Schwangerschaft schuetzen eher vor Allergien beim Kind, als sie zu foerdern.",
    alternativen: [],
  },
  {
    name: "Lakritze",
    syn: ["lakritze", "lakritz", "succus"],
    status: "bedingt",
    text: "Groessere Mengen Glycyrrhizin koennen den Blutdruck erhoehen. Gelegentlich ein Stueck ist unproblematisch, taeglicher Konsum nicht.",
    alternativen: ["Fruchtgummi ohne Lakritz"],
  },
  {
    name: "Softeis und Glace",
    syn: ["softeis", "glace", "eis", "gelato", "speiseeis"],
    varianten: [
      { label: "Abgepackt aus dem Laden", status: "ok", text: "Industriell hergestellt mit pasteurisierten Zutaten." },
      { label: "Softeis aus der Maschine", status: "meiden", text: "Softeismaschinen sind schwer zu reinigen und ein klassisches Listerien-Risiko." },
      { label: "Offene Glace aus der Gelateria", status: "bedingt", text: "Bei sauberem Betrieb und hohem Umsatz vertretbar; Sorten mit rohem Ei meiden." },
    ],
    alternativen: ["Abgepacktes Glace", "Sorbet"],
  },
  {
    name: "Leitungswasser",
    syn: ["leitungswasser", "hahnenwasser", "wasser"],
    status: "ok",
    text: "In der Schweiz unbedenklich und die beste Durstloescherin. Nach laengerer Standzeit kurz ablaufen lassen.",
    alternativen: [],
  },
];

/* ---------------------------- Logik ---------------------------- */

const ET = new Date(2030, 0, 1); // Platzhalter, echter Termin nicht im Repo

function schwangerschaftsStand() {
  const heute = new Date();
  const tageBis = Math.round((ET - heute) / 86400000);
  const tage = Math.max(0, 280 - tageBis);
  return {
    woche: Math.floor(tage / 7),
    tag: tage % 7,
    tageBis,
    trimester: tage / 7 < 14 ? 1 : tage / 7 < 28 ? 2 : 3,
  };
}

function normalisieren(s) {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function suchen(begriff) {
  const q = normalisieren(begriff);
  if (q.length < 2) return [];
  return DATEN.map((e) => {
    const felder = [normalisieren(e.name), ...e.syn.map(normalisieren)];
    let punkte = 0;
    for (const f of felder) {
      if (f === q) punkte = Math.max(punkte, 3);
      else if (f.startsWith(q)) punkte = Math.max(punkte, 2);
      else if (f.includes(q) || q.includes(f)) punkte = Math.max(punkte, 1);
    }
    return { eintrag: e, punkte };
  })
    .filter((t) => t.punkte > 0)
    .sort((a, b) => b.punkte - a.punkte)
    .map((t) => t.eintrag);
}

const AMPEL = {
  ok: { wort: "Ja", kurz: "Ja", farbe: "#14432F", flaeche: "#DBE7DE" },
  bedingt: { wort: "Mit Bedingung", kurz: "Bedingt", farbe: "#7A5311", flaeche: "#EFE6D5" },
  meiden: { wort: "Besser nicht", kurz: "Nein", farbe: "#7A1E28", flaeche: "#F0DCDE" },
  unklar: { wort: "Nicht hinterlegt", kurz: "Unklar", farbe: "#55605A", flaeche: "#E4E6E1" },
};

const BELIEBT = ["Camembert", "Sushi", "Kaffee", "Salami", "Tiramisu", "Lachs"];

/* ---------------------------- UI ---------------------------- */

export default function EssenCheck() {
  const [begriff, setBegriff] = useState("");
  const [offen, setOffen] = useState(null);
  const stand = useMemo(schwangerschaftsStand, []);
  const treffer = useMemo(() => suchen(begriff), [begriff]);

  const oeffnen = (e) => setOffen(e);
  const zuruecksetzen = () => { setBegriff(""); setOffen(null); };

  return (
    <div className="wrap">
      <style>{`
        .wrap { font-family: "Avenir Next", "Segoe UI", system-ui, sans-serif;
          background:#F4F5F2; color:#16211C; min-height:100vh; padding:20px 18px 48px; }
        .kopf { display:flex; justify-content:space-between; align-items:baseline;
          background:#14432F; color:#F4F5F2; margin:-20px -18px 22px; padding:22px 18px 18px; }
        .kopf h1 { font-weight:600; font-size:21px; margin:0; letter-spacing:-0.02em; }
        .stand { font-size:12.5px; color:#B9CFC2; text-align:right; line-height:1.4; }
        .suchfeld { width:100%; box-sizing:border-box; font-size:17px; padding:15px 16px;
          border:1px solid #C9CCC3; border-radius:2px; background:#fff; color:#16211C;
          font-family:inherit; }
        .suchfeld:focus { outline:2px solid #14432F; outline-offset:-1px; border-color:#14432F; }
        .liste { list-style:none; margin:14px 0 0; padding:0; }
        .liste li button { width:100%; text-align:left; background:none; border:none;
          border-bottom:1px solid #E1E3DC; padding:14px 2px; font-size:16px; color:#16211C;
          font-family:inherit; cursor:pointer; }
        .liste li button:hover { background:#EAECE6; }
        .chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }
        .chip { background:#fff; border:1px solid #CBCEC5; border-radius:20px;
          padding:7px 14px; font-size:14px; cursor:pointer; font-family:inherit; color:#3B453E; }
        .karte { margin-top:20px; background:#fff; border:1px solid #DCDED6; padding:20px 18px; }
        .titel { font-size:24px; font-weight:600; letter-spacing:-0.02em; margin:0 0 16px;
          font-weight:400; line-height:1.25; }
        .urteil { display:inline-block; font-size:15px; font-weight:600; padding:8px 14px;
          border-radius:3px; margin-bottom:14px; }
        .text { font-size:15.5px; line-height:1.65; margin:0 0 16px; }
        .frage { font-size:13px; color:#5F6B62; margin:0 0 10px; }
        .zeile { display:flex; gap:11px; padding:13px 0; border-top:1px solid #E5E7E0; }
        .zeile:first-of-type { border-top:none; padding-top:4px; }
        .marke { flex:0 0 auto; font-size:12px; font-weight:700; padding:4px 9px;
          border-radius:2px; margin-top:1px; min-width:52px; text-align:center; }
        .zlabel { font-size:15.5px; font-weight:600; margin:0 0 3px; line-height:1.35; }
        .ztext { font-size:14.5px; line-height:1.55; margin:0; color:#3B453E; }
        .alt { border-top:1px solid #E5E7E0; padding-top:14px; margin-top:4px; }
        .alt p { font-size:13px; color:#5F6B62; margin:0 0 8px; }
        .alt ul { margin:0; padding-left:18px; font-size:15px; line-height:1.7; }
        .warnung { background:#EFE6D5; border-left:3px solid #7A5311; padding:12px 14px;
          font-size:14.5px; line-height:1.55; margin-bottom:16px; }
        .fuss { margin-top:26px; font-size:12.5px; color:#6A746C; line-height:1.6;
          border-top:1px solid #D8DAD2; padding-top:14px; }
        .zurueck { background:none; border:none; color:#14432F; font-size:14px;
          padding:0; cursor:pointer; font-family:inherit; margin-top:16px; }
      `}</style>

      <div className="kopf">
        <h1>Darf ich das essen?</h1>
        <div className="stand">
          Woche {stand.woche}+{stand.tag}<br />
          {stand.trimester}. Trimester · noch {stand.tageBis} Tage
        </div>
      </div>

      {!offen && (
        <>
          <input
            className="suchfeld"
            placeholder="Lebensmittel eingeben"
            value={begriff}
            onChange={(e) => setBegriff(e.target.value)}
            autoFocus
          />
          {begriff.length < 2 && (
            <div className="chips">
              {BELIEBT.map((b) => (
                <button key={b} className="chip" onClick={() => setBegriff(b)}>{b}</button>
              ))}
            </div>
          )}
          {begriff.length >= 2 && treffer.length > 0 && (
            <ul className="liste">
              {treffer.map((e) => (
                <li key={e.name}>
                  <button onClick={() => oeffnen(e)}>{e.name}</button>
                </li>
              ))}
            </ul>
          )}
          {begriff.length >= 2 && treffer.length === 0 && (
            <div className="karte">
              <span className="urteil" style={{ color: AMPEL.unklar.farbe, background: AMPEL.unklar.flaeche }}>
                Nicht hinterlegt
              </span>
              <p className="text">
                Zu «{begriff}» ist hier nichts geprueft hinterlegt. Statt zu raten: kurz der Hebamme
                schreiben — und den Begriff notieren, damit er nachgetragen wird.
              </p>
            </div>
          )}
        </>
      )}

      {offen && (
        <div className="karte">
          <h2 className="titel">{offen.name}</h2>

          {offen.trimesterHinweis === 1 && stand.trimester === 1 && (
            <div className="warnung">
              Im ersten Trimester besonders relevant: In dieser Phase werden die Organe angelegt,
              hohe Vitamin-A-Dosen wirken hier am staerksten.
            </div>
          )}

          {offen.varianten ? (
            <>
              <p className="frage">{offen.frage || "Je nach Zubereitung"}</p>
              {offen.varianten.map((v, i) => (
                <div className="zeile" key={i}>
                  <span className="marke" style={{ color: AMPEL[v.status].farbe, background: AMPEL[v.status].flaeche }}>
                    {AMPEL[v.status].kurz}
                  </span>
                  <div>
                    <p className="zlabel">{v.label}</p>
                    <p className="ztext">{v.text}</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <span className="urteil" style={{ color: AMPEL[offen.status].farbe, background: AMPEL[offen.status].flaeche }}>
                {AMPEL[offen.status].wort}
              </span>
              <p className="text">{offen.text}</p>
            </>
          )}

          {offen.alternativen && offen.alternativen.length > 0 && (
            <div className="alt" style={{ marginTop: 16 }}>
              <p>Stattdessen</p>
              <ul>{offen.alternativen.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>
          )}

          <button className="zurueck" onClick={zuruecksetzen}>Neue Suche</button>
        </div>
      )}

      <p className="fuss">
        Kuratierte Angaben nach den gaengigen Schweizer Empfehlungen. Ersetzt keine Beratung
        durch Hebamme oder Aerztin — im Zweifel dort nachfragen.
      </p>
    </div>
  );
}
