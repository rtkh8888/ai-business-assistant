"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

function normalizeInputUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Please enter a website URL.");
  }

  const withScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withScheme);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Please enter an http or https URL.");
  }

  return parsed.toString();
}

export function UrlAnalysisForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const normalizedUrl = normalizeInputUrl(value);
      setError(null);

      startTransition(() => {
        router.push(`/analyze?website=${encodeURIComponent(normalizedUrl)}`);
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Invalid URL.");
    }
  }

  return (
    <form className="analysis-form" onSubmit={onSubmit}>
      <label className="field">
        <span className="field-label">Website URL</span>
        <input
          aria-invalid={Boolean(error)}
          className="input"
          inputMode="url"
          name="website"
          placeholder="https://example.com"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="form-hint">Enter one business website at a time. We’ll normalize it first.</p>
      )}

      <div className="form-actions">
        <button className="button button-primary" disabled={isPending} type="submit">
          {isPending ? "Analyzing..." : "Analyze website"}
        </button>
        <a className="button button-secondary" href="/leads">
          View leads
        </a>
      </div>
    </form>
  );
}

