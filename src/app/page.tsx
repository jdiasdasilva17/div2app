import { BottomNav } from "@/app/_components/BottomNav";
import { getMatches, getStandings } from "@/lib/db/repository";

function formatResult(homeSets: number | null, awaySets: number | null): string {
  if (homeSets === null || awaySets === null) {
    return "Por disputar";
  }

  return `${homeSets} - ${awaySets}`;
}

export default async function HomePage() {
  const allMatches = await getMatches();
  const now = new Date();

  const nextMatch = allMatches.find((m) => new Date(m.matchDateIso) >= now);
  const lastFinished = [...allMatches]
    .reverse()
    .find((m) => m.status === "finished" && (m.homeTeam === "Esmoriz GC" || m.awayTeam === "Esmoriz GC"));
  const tableTop = (await getStandings("2a Fase - Prim.")).slice(0, 4);

  return (
    <main className="stack">
      <div>
        <p className="badge">II Divisao Nacional Masculina</p>
        <h1 className="page-title">Tracker Esmoriz GC</h1>
        <p className="page-subtitle">Resultados, calendario, classificacao e confrontos diretos.</p>
      </div>

      <section className="card stack">
        <h2 className="page-title">Proximo jogo do Esmoriz</h2>
        {nextMatch ? (
          <>
            <strong>
              {nextMatch.homeTeam} vs {nextMatch.awayTeam}
            </strong>
            <span>{new Date(nextMatch.matchDateIso).toLocaleString("pt-PT")}</span>
            <span className="page-subtitle">Fase: {nextMatch.phase}</span>
          </>
        ) : (
          <span>Sem jogo futuro encontrado.</span>
        )}
      </section>

      <section className="card stack">
        <h2 className="page-title">Ultimo resultado do Esmoriz</h2>
        {lastFinished ? (
          <>
            <strong>
              {lastFinished.homeTeam} {formatResult(lastFinished.homeSets, lastFinished.awaySets)} {lastFinished.awayTeam}
            </strong>
            <span>{new Date(lastFinished.matchDateIso).toLocaleString("pt-PT")}</span>
          </>
        ) : (
          <span>Ainda sem resultados registados.</span>
        )}
      </section>

      <section className="card stack">
        <h2 className="page-title">Top classificacao</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Equipa</th>
                <th>Pts</th>
                <th>J</th>
              </tr>
            </thead>
            <tbody>
              {tableTop.map((row) => (
                <tr key={row.team}>
                  <td>{row.rank}</td>
                  <td>{row.team}</td>
                  <td>{row.points}</td>
                  <td>{row.played}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
