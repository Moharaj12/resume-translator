import type { ResumeJSON } from "./schema";

const HEADING_ALIASES: Record<string, string> = {
  "work experience": "experience",
  experience: "experience",
  "professional experience": "experience",
  employment: "experience",

  education: "education",

  skills: "skills",
  "technical skills": "skills",
  "core skills": "skills",

  projects: "projects",
  "personal projects": "projects",

  summary: "summary",
  profile: "summary",
};

function normalizeLine(line: string) {
  // Normalize bullet symbols to "- "
  const trimmed = line.replace(/\t/g, " ").trim();
  if (!trimmed) return "";
  const bulletLike = /^[•●▪◦‣∙–—-]\s+/.test(trimmed);
  if (bulletLike) return "- " + trimmed.replace(/^[•●▪◦‣∙–—-]\s+/, "");
  return trimmed;
}

function normalizeText(raw: string) {
  const lines = raw
    .split(/\r?\n/)
    .map(normalizeLine)
    .map((l) => l.replace(/\s{2,}/g, " ").trim());

  // Keep blank lines (section boundaries), but avoid huge runs
  const compact: string[] = [];
  let blanks = 0;
  for (const l of lines) {
    if (l === "") {
      blanks++;
      if (blanks <= 1) compact.push("");
    } else {
      blanks = 0;
      compact.push(l);
    }
  }
  return compact;
}

function isHeading(line: string) {
  const key = line.toLowerCase().replace(/[:]/g, "").trim();
  return Boolean(HEADING_ALIASES[key]);
}

function headingKey(line: string) {
  const key = line.toLowerCase().replace(/[:]/g, "").trim();
  return HEADING_ALIASES[key];
}

function extractHeaderBlock(lines: string[]) {
  // Everything until first heading
  const headerLines: string[] = [];
  for (const l of lines) {
    if (isHeading(l)) break;
    headerLines.push(l);
  }

  const headerText = headerLines.filter(Boolean).join(" | ");

  const email = headerText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone =
    headerText.match(
      /(\+?\d{1,2}\s*)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/,
    )?.[0] ?? undefined;

  const links = headerText.match(/https?:\/\/\S+/g) ?? [];

  // Name heuristic: first non-empty line
  const name = headerLines.find((l) => l && !l.startsWith("- ")) ?? undefined;

  return {
    name,
    email,
    phone,
    links: links.length ? links : undefined,
  };
}

export function parseResumeFromText(rawText: string): ResumeJSON {
  const lines = normalizeText(rawText);

  const header = extractHeaderBlock(lines);

  // Build section buckets
  let currentSection: string | null = null;
  const sections: Record<string, string[]> = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
  };

  for (const line of lines) {
    if (isHeading(line)) {
      currentSection = headingKey(line);
      continue;
    }
    if (!currentSection) continue;
    sections[currentSection].push(line);
  }

  const summary =
    sections.summary.filter(Boolean).join(" ").trim() || undefined;

  const skills = sections.skills
    .join("\n")
    .split(/[,|•]\s*/)
    .map((s) => s.replace(/^- /, "").trim())
    .filter(Boolean);

  const experience = parseExperience(sections.experience);
  const education = parseEducation(sections.education);
  const projects = parseProjects(sections.projects);

  return {
    header,
    summary,
    skills: skills.length ? skills : undefined,
    experience,
    education,
    projects: projects.length ? projects : undefined,
  };
}

function parseExperience(lines: string[]) {
  const entries: Array<{
    company?: string;
    role?: string;
    bullets: string[];
    startDate?: string;
    endDate?: string;
  }> = [];

  let current: (typeof entries)[number] | null = null;

  for (const line of lines) {
    if (!line) continue;

    if (line.startsWith("- ")) {
      if (!current) {
        current = { bullets: [] };
        entries.push(current);
      }
      current.bullets.push(line.replace(/^- /, "").trim());
      continue;
    }

    // New entry heuristic: non-bullet line after a blank or after many bullets
    if (!current || current.bullets.length > 0) {
      current = { bullets: [] };
      entries.push(current);
    }

    // Split "Role – Company" or "Company – Role"
    const dashSplit = line.split(/\s[–—-]\s/);
    if (dashSplit.length >= 2) {
      current.role = dashSplit[0]?.trim() || current.role;
      current.company =
        dashSplit.slice(1).join(" - ").trim() || current.company;
    } else {
      // If only one line, store as role if empty else company
      if (!current.role) current.role = line.trim();
      else if (!current.company) current.company = line.trim();
    }

    // Date range heuristic
    const dateRange = line.match(
      /((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\w*|\d{4}).{0,15}(Present|\d{4})/i,
    );
    if (dateRange) {
      current.startDate = current.startDate ?? dateRange[0];
    }
  }

  // Remove empty placeholder entries
  return entries
    .map((e) => ({
      company: e.company,
      role: e.role,
      startDate: e.startDate,
      endDate: e.endDate,
      bullets: e.bullets,
    }))
    .filter((e) => e.company || e.role || e.bullets.length);
}

function parseEducation(lines: string[]) {
  const entries: Array<{
    school?: string;
    program?: string;
    bullets?: string[];
  }> = [];

  let current: (typeof entries)[number] | null = null;

  for (const line of lines) {
    if (!line) continue;

    if (line.startsWith("- ")) {
      if (!current) {
        current = {};
        entries.push(current);
      }
      current.bullets = current.bullets ?? [];
      current.bullets.push(line.replace(/^- /, "").trim());
      continue;
    }

    if (!current || (current.school && current.program)) {
      current = {};
      entries.push(current);
    }

    if (!current.school) current.school = line.trim();
    else if (!current.program) current.program = line.trim();
  }

  return entries.filter(
    (e) => e.school || e.program || (e.bullets?.length ?? 0),
  );
}

function parseProjects(lines: string[]) {
  const entries: Array<{ name?: string; bullets: string[] }> = [];
  let current: (typeof entries)[number] | null = null;

  for (const line of lines) {
    if (!line) continue;

    if (line.startsWith("- ")) {
      if (!current) {
        current = { bullets: [] };
        entries.push(current);
      }
      current.bullets.push(line.replace(/^- /, "").trim());
      continue;
    }

    current = { name: line.trim(), bullets: [] };
    entries.push(current);
  }

  return entries.filter((p) => p.name || p.bullets.length);
}
