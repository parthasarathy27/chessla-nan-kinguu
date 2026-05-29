"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, LogIn } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/play";

  const [email, setEmail] = useState("admin@chessgame.com");
  const [password, setPassword] = useState("chess123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password. Try the demo credentials below.");
    } else {
      router.push(callbackUrl);
    }
  }

  const DEMOS = [
    { label: "Grand Master", email: "admin@chessgame.com", pass: "chess123" },
    { label: "Chess Player", email: "player@chessgame.com", pass: "play123" },
    { label: "Knight Rider", email: "knight@chessgame.com", pass: "knight123" },
  ];

  return (
    <motion.div
      className="glass-card auth-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Crown size={40} style={{ color: "var(--gold)" }} /></div>
        <h1 className="auth-title gold-text">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue your chess journey</p>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-gold btn-lg" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Signing in...
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <LogIn size={18} /> Sign In
            </span>
          )}
        </button>
      </form>

      <div className="auth-divider" style={{ marginTop: 24 }}>Demo Accounts</div>

      <div className="demo-credentials">
        <p style={{ marginBottom: 10, fontWeight: 600, color: "var(--gold)" }}>Click to auto-fill:</p>
        {DEMOS.map((d) => (
          <button
            key={d.email}
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 6, width: "100%", justifyContent: "flex-start", textAlign: "left" }}
            onClick={() => { setEmail(d.email); setPassword(d.pass); }}
            type="button"
          >
            <strong style={{ color: "var(--gold)" }}>{d.label}</strong>
            <span style={{ marginLeft: 8, color: "var(--text-muted)", fontSize: "0.78rem" }}>{d.email}</span>
          </button>
        ))}
      </div>

      <p className="auth-footer">
        Don&apos;t have an account? <Link href="/register">Create one</Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh", flexDirection: "column", gap: 16 }}>
          <div className="spinner" style={{ width: 48, height: 48 }} />
          <p style={{ color: "var(--text-muted)" }}>Loading login form...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
