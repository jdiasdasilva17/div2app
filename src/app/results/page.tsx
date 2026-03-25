import { BottomNav } from "@/app/_components/BottomNav";
import { getMatches } from "@/lib/db/repository";

function resultLabel(homeSets: number | null, awaySets: number | null): string {
  if (homeSets === null || awaySets === null) {
    return "Aguarda resultado";
  }

  return `${homeSets} - ${awaySets}`;
}

export default async function ResultsPage() {
  const items = await getMatches();

  return (
    <main className="stack">
      <div>
        <h1 className="page-title">Resultados e Calendario</h1>
        <p className="page-subtitle">Competicao completa com foco no Esmoriz GC.</p>
      </div>

      <div className="stack">
        {items.map((match) => (
          <article key={match.id} className="card stack">
            <span className="badge">{match.phase}</span>
            <strong>
              {match.homeTeam} vs {match.awayTeam}
            </strong>
            <span>{new Date(match.matchDateIso).toLocaleString("pt-PT")}</span>
            <span>
              Resultado: <strong>{resultLabel(match.homeSets, match.awaySets)}</strong>
            </span>
          </article>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
