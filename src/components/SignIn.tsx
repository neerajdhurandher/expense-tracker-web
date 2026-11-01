"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setBusy(true);
    try {
      await signIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-3xl font-bold">Expenses</h1>
      <p className="text-muted">Sign in with the Google account you use in the Android app.</p>
      <button
        onClick={handleSignIn}
        disabled={busy}
        className="rounded-full bg-accent px-6 py-3 font-semibold text-black disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in with Google"}
      </button>
      {error && <p className="max-w-md text-center text-sm text-red-400">{error}</p>}
    </main>
  );
}
