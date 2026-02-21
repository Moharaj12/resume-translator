import React from "react";

type ResumeJSON = {
  header: {
    name?: string;
    title?: string;
    location?: string;
    email?: string;
    phone?: string;
    links?: string[];
  };
  summary?: string;
  skills?: string[];
  experience: Array<{
    company?: string;
    role?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    bullets: string[];
  }>;
  education: Array<{
    school?: string;
    program?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    bullets?: string[];
  }>;
  projects?: Array<{
    name?: string;
    bullets: string[];
  }>;
};

export function ResumePreview({ resume }: { resume: ResumeJSON }) {
  return (
    <div style={wrap}>
      <div style={headerWrap}>
        <div style={name}>{resume.header?.name ?? "Unnamed"}</div>

        <div style={metaRow}>
          {resume.header?.title && <span>{resume.header.title}</span>}
          {resume.header?.location && <Dot />}
          {resume.header?.location && <span>{resume.header.location}</span>}
        </div>

        <div style={metaRow}>
          {resume.header?.email && <span>{resume.header.email}</span>}
          {resume.header?.phone && <Dot />}
          {resume.header?.phone && <span>{resume.header.phone}</span>}
          {resume.header?.links?.length ? <Dot /> : null}
          {resume.header?.links?.length ? (
            <span style={{ wordBreak: "break-all" }}>
              {resume.header.links.join(" · ")}
            </span>
          ) : null}
        </div>
      </div>

      {resume.summary && (
        <Section title="Summary">
          <p style={p}>{resume.summary}</p>
        </Section>
      )}

      {resume.skills?.length ? (
        <Section title="Skills">
          <div style={skillsWrap}>
            {resume.skills.map((s, i) => (
              <span key={`${s}-${i}`} style={pill}>
                {s}
              </span>
            ))}
          </div>
        </Section>
      ) : null}

      {resume.experience?.length ? (
        <Section title="Experience">
          {resume.experience.map((e, idx) => (
            <Entry
              key={`${e.company ?? "company"}-${idx}`}
              title={e.role}
              subtitle={e.company}
              right={formatDates(e.startDate, e.endDate)}
              bullets={e.bullets}
            />
          ))}
        </Section>
      ) : null}

      {resume.education?.length ? (
        <Section title="Education">
          {resume.education.map((ed, idx) => (
            <Entry
              key={`${ed.school ?? "school"}-${idx}`}
              title={ed.program}
              subtitle={ed.school}
              right={formatDates(ed.startDate, ed.endDate)}
              bullets={ed.bullets ?? []}
            />
          ))}
        </Section>
      ) : null}

      {resume.projects?.length ? (
        <Section title="Projects">
          {resume.projects.map((pjt, idx) => (
            <Entry
              key={`${pjt.name ?? "project"}-${idx}`}
              title={pjt.name}
              bullets={pjt.bullets}
            />
          ))}
        </Section>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={sectionTitle}>{title.toUpperCase()}</div>
      <div style={divider} />
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
}

function Entry({
  title,
  subtitle,
  right,
  bullets,
}: {
  title?: string;
  subtitle?: string;
  right?: string;
  bullets?: string[];
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={entryTopRow}>
        <div style={{ minWidth: 0 }}>
          {title ? <div style={entryTitle}>{title}</div> : null}
          {subtitle ? <div style={entrySubtitle}>{subtitle}</div> : null}
        </div>
        {right ? <div style={entryRight}>{right}</div> : null}
      </div>

      {bullets?.length ? (
        <ul style={ul}>
          {bullets.map((b, i) => (
            <li key={i} style={li}>
              {b}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Dot() {
  return <span style={{ margin: "0 8px", opacity: 0.6 }}>•</span>;
}

function formatDates(start?: string, end?: string) {
  if (!start && !end) return "";
  if (start && end) return `${start} – ${end}`;
  return start ?? end ?? "";
}

const wrap: React.CSSProperties = {
  background: "#ffffff",
  color: "#111111",
  borderRadius: 14,
  padding: 20,
  border: "1px solid rgba(0,0,0,0.08)",
};

const headerWrap: React.CSSProperties = { textAlign: "center" };
const name: React.CSSProperties = { fontSize: 24, fontWeight: 800 };
const metaRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  marginTop: 6,
  fontSize: 13,
  opacity: 0.9,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 1,
  opacity: 0.9,
};

const divider: React.CSSProperties = {
  height: 1,
  background: "rgba(0,0,0,0.12)",
  marginTop: 6,
};

const p: React.CSSProperties = {
  margin: 0,
  fontSize: 13.5,
  lineHeight: 1.5,
};

const skillsWrap: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const pill: React.CSSProperties = {
  fontSize: 12.5,
  border: "1px solid rgba(0,0,0,0.15)",
  padding: "6px 10px",
  borderRadius: 999,
};

const entryTopRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 12,
};

const entryTitle: React.CSSProperties = { fontWeight: 800, fontSize: 14 };
const entrySubtitle: React.CSSProperties = { fontSize: 13.25, opacity: 0.85 };
const entryRight: React.CSSProperties = {
  fontSize: 12.5,
  opacity: 0.75,
  whiteSpace: "nowrap",
};

const ul: React.CSSProperties = {
  margin: "8px 0 0 0",
  paddingLeft: 18,
};

const li: React.CSSProperties = {
  marginBottom: 6,
  fontSize: 13.25,
  lineHeight: 1.45,
};
