import { NextResponse } from "next/server";
import { NLLB_LANG, translateResumeDeep } from "@/translate/nllb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { resume, language } = await req.json();

    if (!resume) {
      return NextResponse.json({ error: "Missing resume" }, { status: 400 });
    }

    if (!language || !NLLB_LANG[language]) {
      return NextResponse.json(
        {
          error:
            "Invalid language. Use one of: " +
            Object.keys(NLLB_LANG).join(", "),
        },
        { status: 400 },
      );
    }

    // Debug logs — check your terminal for these
    console.log("HF_TOKEN present:", !!process.env.HF_TOKEN);
    console.log("Translating to:", language, "→", NLLB_LANG[language]);

    const tgt = NLLB_LANG[language];
    const translated = await translateResumeDeep(resume, tgt);

    return NextResponse.json({ translated });
  } catch (err: any) {
    // Full error logged to terminal
    console.error("Translation failed:", err);
    return NextResponse.json(
      { error: err?.message ?? "Translate failed" },
      { status: 500 },
    );
  }
}
