"use client";

import { useState } from "react";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  async function runResearch(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Request failed with ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) setResult((prev) => prev + decoder.decode(value));
      }
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 10, height: 10, background: '#22c55e', borderRadius: 9999 }}></div>
        <h1 style={{ margin: 0 }}>AI Digital Product Research Agent</h1>
      </div>
      <p style={{ color: '#475569', marginTop: 8 }}>
        Enter a product idea, market, or niche. The agent will map demand, problems, competitors, pricing, channels, and opportunities.
      </p>

      <form onSubmit={runResearch} style={{ marginTop: 20, display: 'grid', gap: 12 }}>
        <textarea
          placeholder="e.g., AI-driven habit tracker for remote workers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={5}
          style={{ padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', resize: 'vertical' }}
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid #0ea5e9',
            background: loading ? '#93c5fd' : '#3b82f6',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            width: 'fit-content'
          }}
        >
          {loading ? 'Researching?' : 'Run Research'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 16, color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 12, borderRadius: 10 }}>
          {error}
        </div>
      )}

      {result && (
        <article style={{ marginTop: 20, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Report</h2>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
            >Copy</button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 12 }}>{result}</pre>
        </article>
      )}

      <footer style={{ marginTop: 40, color: '#64748b' }}>
        Tip: set <code>OPENAI_API_KEY</code> and optional <code>TAVILY_API_KEY</code> for web-backed research.
      </footer>
    </main>
  );
}
