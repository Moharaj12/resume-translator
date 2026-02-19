"use client";

import { useRef, useState } from "react";

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

  function onReset() {
    setFile(null);
    setUploadResult(null);
    setConfirmed(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Upload Resume</h1>
      <p style={{ opacity: 0.8 }}>
        v1 supports <b>.docx</b> and <b>.txt</b>. First select a file, then
        upload & parse, then confirm.
      </p>

      {/* Hidden real file input */}
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
        }}
      />

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginTop: 16,
          flexWrap: "wrap",
        }}
      >
        <button onClick={openFilePicker} style={btnStyle(false, true)}>
          Select File
        </button>

        <span style={{ fontSize: 14, opacity: 0.85 }}>
          {file ? `Selected: ${file.name}` : "No file selected"}
        </span>

        <button
          onClick={onUploadAndParse}
          disabled={loadingUpload}
          style={btnStyle(loadingUpload)}
        >
          {loadingUpload ? "Uploading..." : "Upload & Parse"}
        </button>

        <button
          onClick={onConfirm}
          disabled={!uploadResult || confirmed}
          style={btnStyle(!uploadResult || confirmed, true)}
        >
          {confirmed ? "Confirmed ✅" : "Confirm"}
        </button>

        <button
          onClick={onReset}
          disabled={loadingUpload}
          style={btnStyle(loadingUpload)}
        >
          Reset
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, color: "crimson" }}>
          <b>Error:</b> {error}
        </div>
      )}

      {uploadResult && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            Parsed Preview {confirmed ? "(Locked)" : "(Review before confirm)"}
          </h2>

          <pre style={preStyle}>
            {JSON.stringify(uploadResult.parsed, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function btnStyle(disabled: boolean, primary = false): React.CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ccc",
    background: primary
      ? disabled
        ? "#f2f2f2"
        : "#111"
      : disabled
      ? "#f7f7f7"
      : "#fff",
    color: primary ? (disabled ? "#888" : "#fff") : "#111",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  };
}

const preStyle: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  border: "1px solid #eee",
  background: "#fafafa",
  color: "#111",
  overflowX: "auto",
  fontSize: 12,
  lineHeight: 1.4,
};
