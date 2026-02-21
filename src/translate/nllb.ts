const LANG_MODELS: Record<string, string> = {
  fr: "Helsinki-NLP/opus-mt-en-fr",
  es: "Helsinki-NLP/opus-mt-en-es",
  de: "Helsinki-NLP/opus-mt-en-de",
  it: "Helsinki-NLP/opus-mt-en-it",
  pt: "Helsinki-NLP/opus-mt-en-pt",
  ar: "Helsinki-NLP/opus-mt-en-ar",
  hi: "Helsinki-NLP/opus-mt-en-hi",
  ru: "Helsinki-NLP/opus-mt-en-ru",
  zh: "Helsinki-NLP/opus-mt-en-zh",
};

// Keep this for the API route to validate languages
export const NLLB_LANG: Record<string, string> = {
  fr: "fr",
  es: "es",
  de: "de",
  it: "it",
  pt: "pt",
  ar: "ar",
  hi: "hi",
  ru: "ru",
  zh: "zh",
};

function protect(text: string) {
  const keep: string[] = [];
  const replaced = text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (m) => {
      keep.push(m);
      return `[[KEEP_${keep.length - 1}]]`;
    })
    .replace(/https?:\/\/\S+/gi, (m) => {
      keep.push(m);
      return `[[KEEP_${keep.length - 1}]]`;
    });

  return { replaced, keep };
}

function unprotect(text: string, keep: string[]) {
  return text.replace(
    /\[\[KEEP_(\d+)\]\]/g,
    (_, idx) => keep[Number(idx)] ?? "",
  );
}

export async function translateText(text: string, tgtLangCode: string) {
  const token = process.env.HF_TOKEN;
  if (!token) throw new Error("Missing HF_TOKEN (add it to .env.local)");

  const trimmed = (text ?? "").trim();
  if (!trimmed) return text;

  const model = LANG_MODELS[tgtLangCode];
  if (!model) throw new Error(`Unsupported language: ${tgtLangCode}`);

  const url = `https://router.huggingface.co/hf-inference/models/${model}`;
  const { replaced, keep } = protect(trimmed);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: replaced,
      options: { wait_for_model: true },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HF error ${res.status}: ${t}`);
  }

  const data = await res.json();
  const translated =
    Array.isArray(data) && data[0]?.translation_text
      ? data[0].translation_text
      : typeof data === "string"
      ? data
      : replaced;

  return unprotect(translated, keep);
}

export async function translateResumeDeep(resume: any, tgtLangCode: string) {
  const out = structuredClone(resume);

  if (out.header) {
    if (out.header.name)
      out.header.name = await translateText(out.header.name, tgtLangCode);
    if (out.header.title)
      out.header.title = await translateText(out.header.title, tgtLangCode);
    if (out.header.location)
      out.header.location = await translateText(
        out.header.location,
        tgtLangCode,
      );
  }

  if (out.summary) out.summary = await translateText(out.summary, tgtLangCode);

  if (Array.isArray(out.skills)) {
    out.skills = await Promise.all(
      out.skills.map((s: string) => translateText(String(s), tgtLangCode)),
    );
  }

  if (Array.isArray(out.experience)) {
    for (const e of out.experience) {
      if (e.company)
        e.company = await translateText(String(e.company), tgtLangCode);
      if (e.role) e.role = await translateText(String(e.role), tgtLangCode);
      if (e.location)
        e.location = await translateText(String(e.location), tgtLangCode);
      if (Array.isArray(e.bullets)) {
        e.bullets = await Promise.all(
          e.bullets.map((b: string) => translateText(String(b), tgtLangCode)),
        );
      }
    }
  }

  if (Array.isArray(out.education)) {
    for (const ed of out.education) {
      if (ed.school)
        ed.school = await translateText(String(ed.school), tgtLangCode);
      if (ed.program)
        ed.program = await translateText(String(ed.program), tgtLangCode);
      if (ed.location)
        ed.location = await translateText(String(ed.location), tgtLangCode);
      if (Array.isArray(ed.bullets)) {
        ed.bullets = await Promise.all(
          ed.bullets.map((b: string) => translateText(String(b), tgtLangCode)),
        );
      }
    }
  }

  if (Array.isArray(out.projects)) {
    for (const p of out.projects) {
      if (p.name) p.name = await translateText(String(p.name), tgtLangCode);
      if (Array.isArray(p.bullets)) {
        p.bullets = await Promise.all(
          p.bullets.map((b: string) => translateText(String(b), tgtLangCode)),
        );
      }
    }
  }

  return out;
}
