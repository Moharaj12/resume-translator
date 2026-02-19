# Resume Translator SaaS (WIP)

A full-stack Next.js application that parses resumes into structured JSON and will translate them into any chosen language.

## Current Features (Phase 1)
- Upload .docx / .txt resumes
- Extract raw text (Mammoth for DOCX)
- Normalize bullets + whitespace
- Heuristic section parsing:
  - Header
  - Summary (if present)
  - Skills
  - Experience
  - Education
  - Projects
- Validate output against a ResumeJSON schema (Zod)
- Upload → Parse → Confirm UI flow
- Dark-mode friendly preview

## Architecture
### Frontend
- Next.js App Router
- Client upload workflow

### Backend
- POST /api/upload
  - Accepts .docx and .txt
  - Extracts text
  - Parses into ResumeJSON
  - Returns JSON for preview/confirmation

## ResumeJSON Contract (v1)
Fields:
- header
- summary?
- skills?
- experience[]
- education[]
- projects?

## Next Steps
- Resume preview renderer component (ATS-style)
- Hugging Face translation route + language dropdown
- Save translations (DB)
- PDF export
- Auth + dashboard
- Deploy to Vercel
