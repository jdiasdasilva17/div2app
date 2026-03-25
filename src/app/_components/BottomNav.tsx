import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/results", label: "Resultados" },
  { href: "/standings", label: "Tabela" },
  { href: "/team/esmoriz-gc", label: "Esmoriz" },
  { href: "/h2h", label: "H2H" },
  { href: "/notifications", label: "Alertas" }
];

export function BottomNav() {
  return (
    <nav className="nav" aria-label="Navegacao principal">
      {links.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
