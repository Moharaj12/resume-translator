# Resume Translator SaaS

A full-stack Next.js application that parses resumes into structured JSON and translates them into multiple target languages using Hugging Face machine translation models.

This project is designed as a production-style SaaS architecture demonstrating:

- File processing
- Heuristic document parsing
- Structured data normalization
- Machine translation integration
- Server-side API routing
- Clean UI state management
- Secure environment variable handling
- Git-based version control discipline

---

## 🔎 Project Overview

Resumes are semi-structured documents that vary widely in formatting, bullet styles, and layout. This application:

1. Accepts resume uploads (.docx and .txt)
2. Extracts raw text (DOCX via Mammoth)
3. Normalizes formatting (bullet cleanup, whitespace reduction)
4. Parses sections into a structured ResumeJSON schema
5. Renders a clean ATS-style preview
6. Translates structured fields into selected languages
7. Displays side-by-side original and translated versions

---

## 🏗 System Architecture

### Frontend
- Next.js App Router
- Client-side state handling for:
  - File selection
  - Upload workflow
  - Confirm state
  - Translation state
- Side-by-side rendering via reusable ResumePreview component

### Backend (API Routes)

#### POST `/api/upload`
- Accepts `.docx` or `.txt`
- Extracts raw text
- Normalizes bullets and whitespace
- Parses structured sections
- Validates against ResumeJSON schema
- Returns structured JSON object

#### POST `/api/translate`
- Accepts ResumeJSON + target language
- Calls Hugging Face translation model
- Protects:
  - Emails
  - URLs
  - Phone numbers
- Translates:
  - Summary
  - Skills
  - Experience
  - Education
  - Projects
- Returns translated ResumeJSON

---

## 📄 ResumeJSON Schema

```ts
type ResumeJSON = {
  header: {
    name?: string
    title?: string
    location?: string
    email?: string
    phone?: string
    links?: string[]
  }
  summary?: string
  skills?: string[]
  experience: [...]
  education: [...]
  projects?: [...]
}
