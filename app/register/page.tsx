"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register account.");
      }

      // Automatically login after successful registration
      const result = await signIn("credentials", { email, password, redirect: false });
      
      if (result?.error) {
        setError("Account created successfully, but automatic login failed. Please sign in manually.");
      } else {
        router.push("/play");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <motion.div
        className="glass-card auth-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><UserPlus size={40} style={{ color: "var(--gold)" }} /></div>
          <h1 className="auth-title gold-text">Create Account</h1>
          <p className="auth-subtitle">Join the chess community today</p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input type="text" className="input-field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" className="input-field" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-gold btn-lg" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <UserPlus size={18} /> Create Account
              </span>
            )}
          </button>
        </form>

        <div className="demo-credentials" style={{ marginTop: 20 }}>
          <p style={{ color: "var(--gold)", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={16} /> Quick Start Demo
          </p>
          <p>Or log in instantly using one of these pre-configured accounts:</p>
          <ul style={{ marginTop: 8, paddingLeft: 16, lineHeight: 2, fontSize: "0.82rem" }}>
            <li><strong style={{ color: "var(--gold)" }}>admin@chessgame.com</strong> / chess123</li>
            <li><strong style={{ color: "var(--gold)" }}>player@chessgame.com</strong> / play123</li>
            <li><strong style={{ color: "var(--gold)" }}>knight@chessgame.com</strong> / knight123</li>
          </ul>
        </div>

        <p className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
