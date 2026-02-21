"use client";

import { useRef, useState } from "react";
import { ResumePreview } from "@/app/components/ResumePreview";

type UploadResult = {
  filename: string;
  rawTextPreview: string;
  parsed: any;
};

export default function NewResumePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("");
  const [translating, setTranslating] = useState(false);
  const [translatedResume, setTranslatedResume] = useState<any>(null);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function onUploadAndParse() {
    if (!file) {
      setError("Please select a .docx or .txt file first.");
      return;
    }
    setLoadingUpload(true);
    setError(null);
    setConfirmed(false);
    setUploadResult(null);
    setTranslatedResume(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setUploadResult(data);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoadingUpload(false);
    }
  }

  function onConfirm() {
    if (!uploadResult) return;
    setConfirmed(true);
  }

  async function onTranslate() {
    if (!uploadResult?.parsed || !confirmed) return;
    if (!language) {
      setError("Select a language first.");
      return;
    }
    setTranslating(true);
    setError(null);
    setTranslatedResume(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: uploadResult.parsed, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Translation failed");
      setTranslatedResume(data.translated);
    } catch (e: any) {
      setError(e?.message ?? "Translation failed");
    } finally {
      setTranslating(false);
    }
  }

  function onReset() {
    setFile(null);
    setUploadResult(null);
    setConfirmed(false);
    setError(null);
    setLanguage("");
    setTranslatedResume(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .resume-page * {
          box-sizing: border-box;
        }

        .resume-page {
          font-family: 'DM Sans', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px;
          min-height: 100vh;
          color: #0f0f0f;
        }

        .page-header {
          margin-bottom: 40px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.5px;
          margin: 0 0 6px 0;
          color: #fff;
        }

        .page-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          margin: 0;
        }

        .page-sub b {
          color: rgba(255,255,255,0.85);
          font-weight: 500;
        }

        /* Card wrapper for controls */
        .controls-card {
          background: #fafafa;
          border: 1px solid #e8e8e8;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 28px;
        }

        .controls-row {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .controls-row + .controls-row {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #ebebeb;
        }

        .file-label {
          font-size: 13px;
          color: #555;
          font-family: 'DM Mono', monospace;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 8px 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        /* Base button */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s;
          white-space: nowrap;
        }

        .btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* Outline button */
        .btn-outline {
          background: #fff;
          border-color: #d4d4d4;
          color: #222;
        }

        .btn-outline:not(:disabled):hover {
          background: #ef4444;
          border-color: #ef4444;
          color: #fff;
        }

        /* Solid dark button */
        .btn-solid {
          background: #111;
          border-color: #111;
          color: #fff;
        }

        .btn-solid:not(:disabled):hover {
          background: #ef4444;
          border-color: #ef4444;
        }

        /* Ghost / subtle button */
        .btn-ghost {
          background: transparent;
          border-color: #d4d4d4;
          color: #555;
        }

        .btn-ghost:not(:disabled):hover {
          background: #ef4444;
          border-color: #ef4444;
          color: #fff;
        }

        /* Confirmed state */
        .btn-confirmed {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #16a34a;
          cursor: default;
        }

        /* Select */
        .lang-select {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid #d4d4d4;
          background: #fff;
          color: #222;
          cursor: pointer;
          transition: border-color 0.15s;
          outline: none;
        }

        .lang-select:focus {
          border-color: #111;
        }

        .lang-select:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* Error */
        .error-box {
          margin-top: 0;
          padding: 10px 14px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 13px;
          color: #dc2626;
        }

        /* Preview section */
        .preview-section {
          margin-top: 8px;
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .preview-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
        }

        .preview-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 20px;
          background: #f3f4f6;
          color: #555;
          border: 1px solid #e5e7eb;
        }

        .preview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .preview-col-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #888;
          margin-bottom: 10px;
        }

        .preview-empty {
          border-radius: 12px;
          padding: 32px 20px;
          border: 1.5px dashed #e0e0e0;
          background: #fafafa;
          color: #aaa;
          font-size: 13px;
          text-align: center;
          line-height: 1.6;
        }

        .divider {
          height: 1px;
          background: #ebebeb;
          margin: 0 0 20px 0;
        }
      `}</style>

      <div className="resume-page">
        <div className="page-header">
          <h1 className="page-title">Resume Translator</h1>
          <p className="page-sub">
            Supports <b>.docx</b> and <b>.txt</b> — upload, confirm, then
            translate.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.txt"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            setUploadResult(null);
            setConfirmed(false);
            setError(null);
            setLanguage("");
            setTranslatedResume(null);
          }}
        />

        <div className="controls-card">
          {/* Row 1: File picker + upload */}
          <div className="controls-row">
            <button className="btn btn-outline" onClick={openFilePicker}>
              Select File
            </button>

            <span className="file-label">
              {file ? file.name : "No file selected"}
            </span>

            <button
              className="btn btn-solid"
              onClick={onUploadAndParse}
              disabled={loadingUpload || !file}
            >
              {loadingUpload ? "Uploading…" : "Upload & Parse"}
            </button>

            <button
              className={`btn ${confirmed ? "btn-confirmed" : "btn-outline"}`}
              onClick={onConfirm}
              disabled={!uploadResult || confirmed}
            >
              {confirmed ? "Confirmed ✓" : "Confirm"}
            </button>

            <button
              className="btn btn-ghost"
              onClick={onReset}
              disabled={loadingUpload}
            >
              Reset
            </button>
          </div>

          {/* Row 2: Translation */}
          <div
            className="controls-row"
            style={{ opacity: confirmed ? 1 : 0.5 }}
          >
            <select
              className="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={!confirmed}
            >
              <option value="">Select language…</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
              <option value="ur">Urdu</option>
            </select>

            <button
              className="btn btn-solid"
              onClick={onTranslate}
              disabled={!confirmed || !language || translating}
            >
              {translating ? "Translating…" : "Translate"}
            </button>
          </div>

          {/* Error inline in card */}
          {error && (
            <div className="controls-row">
              <div className="error-box">⚠ {error}</div>
            </div>
          )}
        </div>

        {/* Side-by-side preview */}
        {uploadResult && (
          <div className="preview-section">
            <div className="preview-header">
              <h2 className="preview-title">Preview</h2>
              <span className="preview-badge">
                {confirmed ? "Locked" : "Review before confirming"}
              </span>
            </div>

            <div className="preview-grid">
              <div>
                <div className="preview-col-label">Original</div>
                <ResumePreview resume={uploadResult.parsed} />
              </div>

              <div>
                <div className="preview-col-label">Translated</div>
                {translatedResume ? (
                  <ResumePreview resume={translatedResume} />
                ) : (
                  <div className="preview-empty">
                    Confirm your resume, select a language,
                    <br />
                    then click <b>Translate</b>.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
