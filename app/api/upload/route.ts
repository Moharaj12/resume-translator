import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { ResumeSchema } from "@/lib/resume/schema";
import { parseResumeFromText } from "@/lib/resume/parse";

export const runtime = "nodejs"; // mammoth needs node runtime

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const filename = file.name.toLowerCase();

    let rawText = "";

    if (filename.endsWith(".txt")) {
      rawText = await file.text();
    } else if (filename.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(arrayBuffer),
      });
      rawText = result.value || "";
    } else {
      return NextResponse.json(
        { error: "Only .docx and .txt are supported in v1" },
        { status: 400 },
      );
    }

    const parsed = parseResumeFromText(rawText);
    const validated = ResumeSchema.parse(parsed);

    return NextResponse.json({
      filename: file.name,
      rawTextPreview: rawText.slice(0, 800),
      parsed: validated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Upload failed" },
      { status: 500 },
    );
  }
}
