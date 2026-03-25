import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PwaBootstrap } from "@/app/_components/PwaBootstrap";
import "./globals.css";

export const metadata: Metadata = {
  title: "Volei Div2 Tracker",
  description: "Resultados, classificacao e calendario da II divisao nacional masculina"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt">
      <body>
        <PwaBootstrap />
        {children}
      </body>
    </html>
  );
}
