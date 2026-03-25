import { BottomNav } from "@/app/_components/BottomNav";
import { getStandings } from "@/lib/db/repository";

export default async function StandingsPage() {
  const rows = await getStandings("2a Fase - Prim.");

  return (
    <main className="stack">
      <div>
        <h1 className="page-title">Classificacao</h1>
        <p className="page-subtitle">2a Fase - Prim.</p>
      </div>

      <section className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Equipa</th>
              <th>Pts</th>
              <th>J</th>
              <th>V</th>
              <th>D</th>
              <th>Sets</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.team}>
                <td>{row.rank}</td>
                <td>{row.team}</td>
                <td>{row.points}</td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.lost}</td>
                <td>
                  {row.setsWon}-{row.setsLost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <BottomNav />
    </main>
  );
}
