import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { Match, StandingRow } from "@/lib/types/competition";
import { normalizeMatch, normalizeStanding } from "@/lib/etl/normalize";

const FPV_COMPETITION_URL = "https://fpv-web.dataproject.com/CompetitionHome.aspx?ID=130";
const FPV_BASE_URL = "https://fpv-web.dataproject.com";

export interface FpvScrapeResult {
  fetchedAtIso: string;
  matches: Match[];
  standings: StandingRow[];
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function parsePtDateTimeToIso(dateText: string, timeText: string): string {
  const [day, month, year] = dateText.split("/");
  return `${year}-${month}-${day}T${timeText}:00Z`;
}

function parseStandingsFromTables($: cheerio.CheerioAPI): StandingRow[] {
  const rows: StandingRow[] = [];

  $("table").each((_, table) => {
    const phaseLabel =
      $(table).prevAll("h4, h3, .subTitle, .title").first().text().replace(/\s+/g, " ").trim() ||
      "Unknown";

    let fallbackRank = 0;

    $(table)
      .find("tr")
      .each((__: number, tr: AnyNode) => {
        const cells = $(tr)
          .find("td")
          .map((___: number, td: AnyNode) => $(td).text().replace(/\s+/g, " ").trim())
          .get()
          .filter(Boolean);

        if (cells.length < 7) {
          return;
        }

        const firstIsRank = /^\d+$/.test(cells[0]);
        const teamName = firstIsRank ? cells[1] : cells[0];
        const points = Number(firstIsRank ? cells[2] : cells[1]);
        const played = Number(firstIsRank ? cells[3] : cells[2]);
        const won = Number(firstIsRank ? cells[4] : cells[3]);
        const lost = Number(firstIsRank ? cells[5] : cells[4]);
        const setsWon = Number(firstIsRank ? cells[6] : cells[5]);
        const setsLost = Number(firstIsRank ? cells[7] : cells[6]);

        if (
          !teamName ||
          Number.isNaN(points) ||
          Number.isNaN(played) ||
          Number.isNaN(won) ||
          Number.isNaN(lost) ||
          Number.isNaN(setsWon) ||
          Number.isNaN(setsLost)
        ) {
          return;
        }

        fallbackRank += 1;
        rows.push(
          normalizeStanding({
            phase: phaseLabel,
            rank: firstIsRank ? Number(cells[0]) : fallbackRank,
            team: teamName,
            points,
            played,
            won,
            lost,
            setsWon,
            setsLost
          })
        );
      });
  });

  return rows;
}

function parseMatchesFromText(html: string): Match[] {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const dateTimeRegex = /(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}:\d{2})(?:\s*VIDEO)?/g;
  const anchors: Array<{ date: string; time: string; index: number }> = [];
  let dateMatch: RegExpExecArray | null;

  while ((dateMatch = dateTimeRegex.exec(text)) !== null) {
    anchors.push({ date: dateMatch[1], time: dateMatch[2], index: dateMatch.index });
  }

  const matches: Match[] = [];
  for (let i = 0; i < anchors.length; i += 1) {
    const current = anchors[i];
    const nextIndex = i + 1 < anchors.length ? anchors[i + 1].index : text.length;
    const chunk = text.slice(current.index, nextIndex);

    const scoreMatch = chunk.match(/\b(\d)\s*-\s*(\d)\b/);
    const teamsMatch = chunk.match(
      /(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}:\d{2})(?:\s*VIDEO)?\s+([A-Za-zÀ-ÿ0-9\.\-\s]{3,45}?)\s+([A-Za-zÀ-ÿ0-9\.\-\s]{3,45}?)(?:\s+\d\s*-\s*\d|\s*$)/
    );

    if (!teamsMatch) {
      continue;
    }

    const homeTeam = teamsMatch[3].replace(/\s+/g, " ").trim();
    const awayTeam = teamsMatch[4].replace(/\s+/g, " ").trim();
    if (!homeTeam || !awayTeam || homeTeam.length < 3 || awayTeam.length < 3) {
      continue;
    }

    const homeSets = scoreMatch ? Number(scoreMatch[1]) : null;
    const awaySets = scoreMatch ? Number(scoreMatch[2]) : null;

    matches.push(
      normalizeMatch({
        id: `fpv-${current.date.replace(/\//g, "")}-${current.time.replace(":", "")}-${slugify(homeTeam)}-${slugify(awayTeam)}`,
        competitionId: 130,
        phase: "Unknown",
        matchDateIso: parsePtDateTimeToIso(current.date, current.time),
        homeTeam,
        awayTeam,
        homeSets,
        awaySets,
        status: homeSets === null || awaySets === null ? "scheduled" : "finished"
      })
    );
  }

  const unique = new Map<string, Match>();
  for (const item of matches) {
    unique.set(item.id, item);
  }

  return [...unique.values()].sort((a, b) => a.matchDateIso.localeCompare(b.matchDateIso));
}

export async function scrapeFpvCompetitionHtml(): Promise<string> {
  const response = await fetch(FPV_COMPETITION_URL, {
    headers: {
      "User-Agent": "div2app-personal-tracker/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`FPV fetch failed with status ${response.status}`);
  }

  const mainHtml = await response.text();
  const $ = cheerio.load(mainHtml);

  const linkedUrls = $("a[href]")
    .map((_, link) => $(link).attr("href") ?? "")
    .get()
    .filter((href) => href.includes("HtmlContent.aspx") && href.includes("ID=130"))
    .map((href) => (href.startsWith("http") ? href : `${FPV_BASE_URL}/${href.replace(/^\//, "")}`));

  const extraCandidates = [
    `${FPV_BASE_URL}/CompetitionStanding.aspx?ID=130`,
    `${FPV_BASE_URL}/Standing.aspx?ID=130`
  ];

  const uniqueUrls = [...new Set([...linkedUrls, ...extraCandidates])].slice(0, 8);
  const extraHtmlParts: string[] = [];

  for (const url of uniqueUrls) {
    try {
      const linkedResponse = await fetch(url, {
        headers: {
          "User-Agent": "div2app-personal-tracker/0.1"
        }
      });
      if (!linkedResponse.ok) {
        continue;
      }

      const linkedHtml = await linkedResponse.text();
      extraHtmlParts.push(`<!-- source:${url} -->${linkedHtml}`);
    } catch {
      // Best effort. If one linked page fails, we still parse what we have.
    }
  }

  return `${mainHtml}\n${extraHtmlParts.join("\n")}`;
}

export function parseFpvCompetition(html: string): FpvScrapeResult {
  const $ = cheerio.load(html);
  const now = new Date().toISOString();
  const parsedStandings = parseStandingsFromTables($);
  const parsedMatches = parseMatchesFromText(html);

  return {
    fetchedAtIso: now,
    matches: parsedMatches,
    standings: parsedStandings
  };
}
