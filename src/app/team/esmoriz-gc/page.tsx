import { BottomNav } from "@/app/_components/BottomNav";
import { getTeamForm, getMatches } from "@/lib/db/repository";

function classifyForm(match: { homeTeam: string; awayTeam: string; homeSets: number | null; awaySets: number | null }): "V" | "D" | "-" {
  if (match.homeSets === null || match.awaySets === null) {
    return "-";
  }

  const esmorizIsHome = match.homeTeam === "Esmoriz GC";
  const esmorizSets = esmorizIsHome ? match.homeSets : match.awaySets;
  const opponentSets = esmorizIsHome ? match.awaySets : match.homeSets;

  return esmorizSets > opponentSets ? "V" : "D";
}

export default async function EsmorizPage() {
  const form = await getTeamForm("Esmoriz GC", 5);
  const upcoming = (await getMatches()).filter(
    (m) => m.status === "scheduled" && (m.homeTeam === "Esmoriz GC" || m.awayTeam === "Esmoriz GC")
  );

  return (
    <main className="stack">
      <div>
        <p className="badge">Equipa</p>
        <h1 className="page-title">Esmoriz GC</h1>
        <p className="page-subtitle">Forma recente e proximos compromissos.</p>
      </div>

      <section className="card stack">
        <h2 className="page-title">Forma ultimos jogos</h2>
        <div>
          {form.length === 0
            ? "Sem jogos concluidos no mock atual."
            : form.map((m) => classifyForm(m)).join(" ")}
        </div>
      </section>

      <section className="card stack">
        <h2 className="page-title">Proximos jogos</h2>
        {upcoming.length === 0 ? (
          <span>Sem jogos agendados.</span>
        ) : (
          upcoming.map((m) => (
            <article key={m.id}>
              <strong>
                {m.homeTeam} vs {m.awayTeam}
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
