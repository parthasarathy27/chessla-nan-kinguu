"use client";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import { cacheClear } from "@/lib/cache";
import { Search, Bell, Wallet, Sun, Moon, LogOut } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();
  const { theme, toggle } = useTheme();

  const handleLogout = async () => {
    cacheClear();
    await signOut({ callbackUrl: "/login" });
  };

  if (!session) return null;
  const user = session.user as any;

  return (
    <header className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
      {/* Search Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--bg-card)", border: "1px solid var(--border)", padding: "10px 18px", borderRadius: 999, width: "100%", maxWidth: 380 }}>
        <Search size={16} style={{ color: "var(--text2)" }} />
        <input
          type="text"
          placeholder="Search players or tournaments..."
          style={{ background: "none", border: "none", outline: "none", color: "var(--text)", width: "100%", fontSize: "0.85rem" }}
        />
      </div>
      
      {/* Header Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button 
          className="theme-toggle" 
          onClick={toggle} 
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} 
          style={{ width: 40, height: 40 }}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button className="theme-toggle" style={{ position: "relative", width: 40, height: 40 }}>
          <Bell size={18} />
          <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, background: "var(--gold)", borderRadius: "50%", boxShadow: "var(--shadow-gold)" }} />
        </button>
        
        <button className="theme-toggle" style={{ width: 40, height: 40 }}>
          <Wallet size={18} />
        </button>
        
        <button 
          className="theme-toggle" 
          onClick={handleLogout} 
          title="Logout" 
          style={{ width: 40, height: 40, color: "var(--err)" }}
        >
          <LogOut size={18} />
        </button>
        
        <div style={{ width: 1, height: 28, background: "var(--border)" }} />
        
        <Link 
          href="/profile" 
          style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", cursor: "pointer" }} 
          className="header-profile-link"
        >
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "0.68rem", fontFamily: "Orbitron, monospace", fontWeight: 700, color: "var(--gold)", letterSpacing: 0.5 }}>CYBER ELITE</p>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{user?.name || "Player"}</p>
          </div>
          <div className="user-avatar" style={{ width: 38, height: 38, fontSize: "0.8rem", margin: 0, border: "2px solid var(--border-gold)", transition: "border-color 0.2s" }}>
            {user?.avatar ?? user?.name?.[0] ?? "?"}
          </div>
        </Link>
      </div>
    </header>
  );
}
