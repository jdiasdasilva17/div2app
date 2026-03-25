import { BottomNav } from "@/app/_components/BottomNav";
import { getHeadToHead } from "@/lib/db/repository";

function scoreLabel(homeSets: number | null, awaySets: number | null): string {
  if (homeSets === null || awaySets === null) {
    return "Sem resultado";
  }

  return `${homeSets} - ${awaySets}`;
}

export default async function HeadToHeadPage() {
  const teamA = "Esmoriz GC";
  const teamB = "C.N. Ginastica";
  const records = await getHeadToHead(teamA, teamB);

  return (
    <main className="stack">
      <div>
        <h1 className="page-title">Confronto Direto</h1>
        <p className="page-subtitle">
          {teamA} vs {teamB}
        </p>
      </div>

      <section className="card stack">
        {records.length === 0 ? (
          <span>Sem historico no dataset atual.</span>
        ) : (
          records.map((m) => (
            <article key={m.id}>
              <strong>
                {m.homeTeam} {scoreLabel(m.homeSets, m.awaySets)} {m.awayTeam}
              </strong>
              <div>{new Date(m.matchDateIso).toLocaleString("pt-PT")}</div>
            </article>
          ))
        )}
      </section>

      <BottomNav />
    </main>
  );
}
