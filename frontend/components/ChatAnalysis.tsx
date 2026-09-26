"use client";

import { useState, useRef } from "react";
import { AnalyzeResponse } from "@/types";

const API_BASE = "http://localhost:8000";

interface ChatAnalysisProps {
  onAnalysisComplete: (result: AnalyzeResponse) => void;
}

function ResultCard({ result }: { result: AnalyzeResponse }) {
  const roiColor =
    result.roi_status.toLowerCase().includes("positive") ||
    result.roi_status.toLowerCase().includes("good")
      ? "text-green-700"
      : result.roi_status.toLowerCase().includes("negative") ||
          result.roi_status.toLowerCase().includes("poor")
        ? "text-red-600"
        : "text-amber-600";

  return (
    <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-green-800">
        AI Analysis Result
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-white border border-green-100 p-4">
          <p className="text-xs text-green-600 font-medium mb-1">Diagnosis</p>
          <p className="text-sm text-gray-800 leading-relaxed">{result.diagnosis}</p>
        </div>
        <div className="rounded-xl bg-white border border-green-100 p-4">
          <p className="text-xs text-green-600 font-medium mb-1">Recommended Action</p>
          <p className="text-sm text-gray-800 leading-relaxed">{result.recommended_action}</p>
        </div>
        <div className="rounded-xl bg-white border border-green-100 p-4">
          <p className="text-xs text-green-600 font-medium mb-1">Cost Estimate</p>
          <p className="text-lg font-bold text-green-900">
            ${result.cost_estimate.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl bg-white border border-green-100 p-4">
          <p className="text-xs text-green-600 font-medium mb-1">ROI Status</p>
          <p className={`text-sm font-semibold ${roiColor}`}>{result.roi_status}</p>
        </div>
      </div>
    </div>
  );
}

export default function ChatAnalysis({ onAnalysisComplete }: ChatAnalysisProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!imageUrl.trim()) {
      setError("Please provide an image URL or upload an image.");
      return;
    }
    if (!text.trim()) {
      setError("Please describe the issue.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl, text }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.detail ?? `Error ${res.status}`);
      }
      const data: AnalyzeResponse = await res.json();
      setResult(data);
      onAnalysisComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-green-200 bg-white shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white text-lg">
          🌿
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Crop Analysis</h2>
          <p className="text-xs text-gray-500">Upload an image and describe symptoms</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image URL input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/crop-photo.jpg"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </div>

        {/* File upload */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">or</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-dashed border-green-300 bg-green-50 px-4 py-2 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
          >
            📎 Upload from device
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {imageUrl && imageUrl.startsWith("blob:") && (
            <span className="text-xs text-green-600">✓ Image selected</span>
          )}
        </div>

        {/* Text input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Describe the issue
          </label>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Yellow spots on leaves, wilting tips, possible fungal infection…"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 resize-none"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Analysing…
            </span>
          ) : (
            "🔍 Analyse Crop"
          )}
        </button>
      </form>

      {result && <ResultCard result={result} />}
    </section>
  );
}
