"use client";

import { useAuth } from "@/context/AuthContext";
import SignIn from "@/components/SignIn";
import ExpensesDashboard from "@/components/ExpensesDashboard";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>;
  }
  return user ? <ExpensesDashboard user={user} /> : <SignIn />;
}
