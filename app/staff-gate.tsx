"use client";

import { FormEvent, useState } from "react";

export default function StaffGate() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setChecking(true);
    setError("");
    const response = await fetch("/api/staff/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    setChecking(false);
    if (response.ok) {
      window.location.reload();
      return;
    }
    const body = await response.json().catch(() => null) as { error?: string } | null;
    setError(body?.error ?? "That passcode didn’t work.");
  }

  return <main className="staff-gate">
    <img src="/muddy-root-logo.png" alt="The Muddy Root logo" />
    <p>Staff Recipe Book</p>
    <h1>The Muddy <em>Root</em></h1>
    <form onSubmit={submit}>
      <label htmlFor="staff-passcode">Staff passcode</label>
      <input id="staff-passcode" type="password" inputMode="numeric" autoComplete="current-password" value={passcode} onChange={event => setPasscode(event.target.value)} autoFocus required />
      {error && <p className="passcode-error" role="alert">{error}</p>}
      <button className="save" disabled={!passcode || checking}>{checking ? "Checking…" : "Open Recipe Book"}</button>
    </form>
  </main>;
}
