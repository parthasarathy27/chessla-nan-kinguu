"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cacheClear } from "@/lib/cache";
import { useTheme } from "@/context/ThemeContext";
import {
  Gamepad2,
  LayoutDashboard,
  User,
  Sun,
  Moon,
  LogOut,
  Crown,
  Puzzle,
  ChevronDown,
  Cpu,
  UserCheck,
  Vote,
  Zap,
  Target,
  BookOpen,
  Compass,
  Database,
  HelpCircle,
  Calculator,
  Tv,
  Users,
  Search,
  ShoppingBag,
  Gift,
  LifeBuoy,
  Globe,
  Award,
  History,
  Sparkles,
  Trophy,
  TrendingUp,
  Bot,
  Flame,
  Calendar,
  GraduationCap,
  Newspaper,
  FileText,
  MessageSquare,
  Shuffle,
  Star
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  // Collapsible submenus state for mobile
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Play: true,
    Puzzles: false,
    Learn: false,
    Train: false,
    Community: false,
    Other: false,
  });

  const toggleExpand = (label: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    cacheClear();
    await signOut({ callbackUrl: "/login" });
  };

  const user = session?.user as any;
  const isLoading = status === "loading";

  // Auto-expand active page submenus on load
  useEffect(() => {
    navLinks.forEach((link) => {
      if (link.subItems) {
        const isChildActive = link.subItems.some((sub) => pathname === sub.href);
        if (isChildActive || pathname === link.href) {
          setExpanded((prev) => ({ ...prev, [link.label]: true }));
        }
      }
    });
  }, [pathname]);

  // Set up navigation configuration based on authentication state
  const navLinks = session
    ? [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard size={18} />,
        },
        {
          href: "/play",
          label: "Play",
          icon: <Gamepad2 size={18} />,
          subItems: [
            { href: "/play", label: "Play Online", icon: <Gamepad2 size={14} /> },
            { href: "/play", label: "Play Bots", icon: <Bot size={14} /> },
            { href: "/play", label: "Play Coach", icon: <Sparkles size={14} /> },
            { href: "/dashboard", label: "Stats", icon: <TrendingUp size={14} /> },
            { href: "/play", label: "Tournaments", icon: <Trophy size={14} /> },
            { href: "/play", label: "Variants", icon: <Shuffle size={14} /> },
            { href: "/play", label: "Game History", icon: <History size={14} /> },
          ],
        },
        {
          href: "/puzzles",
          label: "Puzzles",
          icon: <Puzzle size={18} />,
          subItems: [
            { href: "/puzzles", label: "Daily Puzzle", icon: <Calendar size={14} /> },
            { href: "/puzzles", label: "Puzzle Rush", icon: <Zap size={14} /> },
            { href: "/puzzles", label: "Puzzle Battle", icon: <Flame size={14} /> },
            { href: "/puzzles", label: "Custom Puzzles", icon: <Puzzle size={14} /> },
          ],
        },
        {
          href: "/puzzles",
          label: "Learn",
          icon: <BookOpen size={18} />,
          subItems: [
            { href: "/play", label: "Lessons", icon: <GraduationCap size={14} /> },
            { href: "/play", label: "Play Coach", icon: <Sparkles size={14} /> },
            { href: "/play", label: "Openings", icon: <Compass size={14} /> },
          ],
        },
        {
          href: "/play",
          label: "Train",
          icon: <Target size={18} />,
          subItems: [
            { href: "/play", label: "Courses", icon: <GraduationCap size={14} /> },
            { href: "/play", label: "Analysis", icon: <Search size={14} /> },
            { href: "/play", label: "Insights", icon: <TrendingUp size={14} /> },
            { href: "/play", label: "Classroom", icon: <Users size={14} /> },
            { href: "/play", label: "Endgames", icon: <Trophy size={14} /> },
            { href: "/play", label: "Practice", icon: <Zap size={14} /> },
            { href: "/play", label: "Aimchess", icon: <Target size={14} /> },
          ],
        },
        {
          href: "/play",
          label: "Watch",
          icon: <Tv size={18} />,
        },
        {
          href: "/play",
          label: "Community",
          icon: <Users size={18} />,
          subItems: [
            { href: "/play", label: "Friends", icon: <UserCheck size={14} /> },
            { href: "/play", label: "Clubs", icon: <Users size={14} /> },
            { href: "/play", label: "Members", icon: <Users size={14} /> },
            { href: "/play", label: "Coaches", icon: <Sparkles size={14} /> },
            { href: "/play", label: "Top Players", icon: <Award size={14} /> },
            { href: "/play", label: "Chess Ratings", icon: <Star size={14} /> },
            { href: "/play", label: "Leaderboards", icon: <Trophy size={14} /> },
            { href: "/play", label: "Chess Today", icon: <Newspaper size={14} /> },
            { href: "/play", label: "News", icon: <Newspaper size={14} /> },
            { href: "/play", label: "Articles", icon: <FileText size={14} /> },
            { href: "/play", label: "Blogs", icon: <FileText size={14} /> },
            { href: "/play", label: "Forums", icon: <MessageSquare size={14} /> },
          ],
        },
        {
          href: "/play",
          label: "Other",
          icon: <Globe size={18} />,
          subItems: [
            { href: "/play", label: "Collections", icon: <BookOpen size={14} /> },
            { href: "/play", label: "Games Database", icon: <Database size={14} /> },
            { href: "/puzzles", label: "Chess Terms", icon: <HelpCircle size={14} /> },
            { href: "/play", label: "Rules", icon: <BookOpen size={14} /> },
            { href: "/play", label: "Explorer", icon: <Compass size={14} /> },
            { href: "/play", label: "Vote Chess", icon: <Vote size={14} /> },
            { href: "/play", label: "Solo Chess", icon: <UserCheck size={14} /> },
            { href: "/play", label: "Computer Championship", icon: <Cpu size={14} /> },
            { href: "/play", label: "ChessKid", icon: <Crown size={14} /> },
            { href: "/play", label: "Tools", icon: <LayoutDashboard size={14} /> },
            { href: "/puzzles", label: "Vision", icon: <Target size={14} /> },
            { href: "/play", label: "Shop / Merch", icon: <ShoppingBag size={14} /> },
            { href: "/profile", label: "Gift", icon: <Gift size={14} /> },
            { href: "/puzzles", label: "Calculator", icon: <Calculator size={14} /> },
          ],
        },
      ]
    : [
        { href: "/", label: "Home", icon: <Crown size={18} /> },
        { href: "/puzzles", label: "Puzzles", icon: <Puzzle size={18} /> },
        { href: "/login", label: "Login", icon: <User size={18} /> },
      ];

  if (isLoading) {
    return (
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          <Crown size={22} style={{ color: "var(--gold)", flexShrink: 0 }} />
          <span className="logo-text">ChessMaster Pro</span>
        </Link>
        <div className="navbar-links" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "10px 0" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-line" style={{ height: "36px", width: "100%", borderRadius: "8px" }} />
          ))}
        </div>
        <div className="navbar-profile-section" style={{ marginTop: "auto", width: "100%" }}>
          <div style={{ height: "1px", background: "var(--border)", marginBottom: "12px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="skeleton-circle" style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <div className="skeleton-line" style={{ height: "12px", width: "70%", borderRadius: "4px" }} />
              <div className="skeleton-line" style={{ height: "10px", width: "40%", borderRadius: "4px" }} />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <Link href="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <Crown size={22} style={{ color: "var(--gold)", flexShrink: 0 }} />
          <span className="logo-text">ChessMaster Pro</span>
        </Link>

        {/* Search Bar - only shown on desktop sidebar layout */}
        {session && (
          <div className="navbar-search-container">
            <Search size={16} />
            <input type="text" placeholder="Search..." aria-label="Search" />
          </div>
        )}

        {/* Nav Links */}
        <div className="navbar-links">
          {navLinks.map((l) => {
            const isMainActive = pathname === l.href;
            const hasSub = !!l.subItems;

            return (
              <div key={l.label} className="nav-item-wrapper">
                <div className="nav-item-container">
                  <Link
                    href={l.href}
                    className={`nav-link${isMainActive ? " active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                    style={{ flex: 1 }}
                  >
                    {l.icon}
                    <span>{l.label}</span>
                  </Link>
                  {hasSub && (
                    <button
                      onClick={(e) => toggleExpand(l.label, e)}
                      className="nav-expand-btn"
                      aria-label="Toggle submenu"
                    >
                      <ChevronDown
                        size={14}
                        style={{
                          transform: expanded[l.label] ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>
                  )}
                </div>

                {/* Sub Menu Flyout - Desktop */}
                {hasSub && (
                  <div className="submenu-flyout">
                    <div className="submenu-flyout-header">{l.label}</div>
                    {l.subItems?.map((sub, sIdx) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          className={`submenu-flyout-link${isSubActive ? " active" : ""}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {sub.icon}
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Sub Menu Links - Mobile Fallback inline list */}
                {hasSub && expanded[l.label] && (
                  <div className="nav-sub-list">
                    {l.subItems?.map((sub, sIdx) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          className={`nav-sub-link${isSubActive ? " active" : ""}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {sub.icon}
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Profile Card & Action Bar */}
        <div className="navbar-profile-section">
          {session ? (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Action Buttons Row */}
              {!["/dashboard", "/play", "/profile", "/puzzles"].includes(pathname) && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={toggle}
                    style={{ flex: 1, padding: "8px", justifyContent: "center", display: "flex", alignItems: "center" }}
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleLogout}
                    style={{ flex: 1, padding: "8px", justifyContent: "center", color: "var(--err)", display: "flex", alignItems: "center" }}
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-gold btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMenuOpen(false)}>
              Play Now
            </Link>
          )}
        </div>

        {/* Mobile Navbar Top Row Components */}
        <div className="navbar-mobile-header-right">
          {session && (
            <div className="badge badge-gold" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span className="status-dot" />
              <span style={{ fontFamily: "Orbitron, monospace", fontSize: ".7rem" }}>
                {user?.rating ?? "—"}
              </span>
            </div>
          )}
          
          <button className="nav-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {session && (
          <div className="dashboard-sidebar-search" style={{ marginBottom: "16px" }}>
            <Search size={16} />
            <input type="text" placeholder="Search..." aria-label="Search" />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {navLinks.map((l) => {
            const isMainActive = pathname === l.href;
            const hasSub = !!l.subItems;

            return (
              <div key={l.label} style={{ width: "100%" }}>
                <div className="nav-item-container">
                  <Link
                    href={l.href}
                    className={`mobile-nav-link${isMainActive ? " active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                    style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    {l.icon}
                    <span>{l.label}</span>
                  </Link>
                  {hasSub && (
                    <button
                      onClick={(e) => toggleExpand(l.label, e)}
                      className="nav-expand-btn"
                      aria-label="Toggle submenu"
                    >
                      <ChevronDown
                        size={14}
                        style={{
                          transform: expanded[l.label] ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>
                  )}
                </div>

                {/* Mobile Sub Menu Links */}
                {hasSub && expanded[l.label] && (
                  <div className="nav-sub-list" style={{ marginLeft: "28px" }}>
                    {l.subItems?.map((sub, sIdx) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          className={`nav-sub-link${isSubActive ? " active" : ""}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {sub.icon}
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile footer extras */}
        {session ? (
          <div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ color: "var(--text2)", textDecoration: "none" }}>Shop</Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ color: "var(--text2)", textDecoration: "none" }}>Gift</Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ color: "var(--text2)", textDecoration: "none" }}>Help</Link>
              <span style={{ color: "var(--text2)" }}>English</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: "10px" }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  toggle();
                }}
                style={{ flex: 1, justifyContent: "center" }}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleLogout}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="btn btn-gold" onClick={() => setMenuOpen(false)} style={{ marginTop: "16px", width: "100%", justifyContent: "center" }}>
            Play Now
          </Link>
        )}
      </div>
    </>
  );
}
