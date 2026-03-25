import * as cheerio from "cheerio";

const PORTUGAL_VOLEIBOL_URL = "https://www.portugalvoleibol.com/classificacao/";

export interface SecondarySourceSnapshot {
  fetchedAtIso: string;
  hasSecondDivisionText: boolean;
  rawTeamsMentioned: string[];
}

export async function scrapePortugalVoleibolHtml(): Promise<string> {
  const response = await fetch(PORTUGAL_VOLEIBOL_URL, {
    headers: {
      "User-Agent": "div2app-personal-tracker/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`PortugalVoleibol fetch failed with status ${response.status}`);
  }

  return response.text();
}

export function parsePortugalVoleibol(html: string): SecondarySourceSnapshot {
  const $ = cheerio.load(html);
  const bodyText = $("body").text().replace(/\s+/g, " ");

  const teams = ["Esmoriz", "Oeiras", "Viana", "Ginastica"]
    .filter((token) => bodyText.toLowerCase().includes(token.toLowerCase()))
    .map((token) => token);

  return {
    fetchedAtIso: new Date().toISOString(),
    hasSecondDivisionText: /2\s*divis/i.test(bodyText),
    rawTeamsMentioned: teams
  };
}
