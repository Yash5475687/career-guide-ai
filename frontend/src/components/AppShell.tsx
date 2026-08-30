import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Compass, Map, ListChecks, BookOpen, Rocket, Bot, CalendarClock,
  ShieldCheck, User as UserIcon, Menu, X, Sun, Moon, Search as SearchIcon, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { GuideMark } from "./GuideMark";
import { GlobalSearch } from "./GlobalSearch";

const NAV_ITEMS = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/roadmap", label: "Roadmap", icon: Map },
  { to: "/app/careers", label: "Career Explorer", icon: Compass },
  { to: "/app/skills", label: "Skill Tracker", icon: ListChecks },
  { to: "/app/resources", label: "Resource Hub", icon: BookOpen },
  { to: "/app/projects", label: "Projects", icon: Rocket },
  { to: "/app/mentor", label: "AI Mentor", icon: Bot },
  { to: "/app/planner", label: "Study Planner", icon: CalendarClock },
  { to: "/app/internship", label: "Internship Readiness", icon: ShieldCheck },
  { to: "/app/profile", label: "Profile", icon: UserIcon },
];

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-ink-border [html.light_&]:border-paper-border h-screen sticky top-0 p-4">
        <div className="flex items-center gap-2 px-2 py-3">
          <GuideMark size={28} />
          <span className="font-display font-semibold tracking-tight">Career Guide AI</span>
        </div>
        <nav className="flex-1 mt-6 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-growth-500/12 text-growth-400"
                    : "text-white/60 hover:text-white hover:bg-white/5 [html.light_&]:text-ink-2/60 [html.light_&]:hover:text-ink-2"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-border [html.light_&]:border-paper-border pt-3 mt-3 flex flex-col gap-1">
          <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 [html.light_&]:text-ink-2/60">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 [html.light_&]:text-ink-2/60">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 border-b border-ink-border [html.light_&]:border-paper-border bg-ink/90 [html.light_&]:bg-paper/90 glass">
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2 -ml-2">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <GuideMark size={22} />
          <span className="font-display font-semibold text-sm">Career Guide AI</span>
        </div>
        <button onClick={() => setSearchOpen(true)} aria-label="Search" className="p-2 -mr-2">
          <SearchIcon size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-ink-2 [html.light_&]:bg-white p-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <GuideMark size={24} />
                <span className="font-display font-semibold">Career Guide AI</span>
              </div>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={22} /></button>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? "bg-growth-500/12 text-growth-400" : "text-white/60 [html.light_&]:text-ink-2/60"
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
              <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 [html.light_&]:text-ink-2/60 mt-2">
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />} {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 [html.light_&]:text-ink-2/60">
                <LogOut size={18} /> Sign out
              </button>
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-ink-border [html.light_&]:border-paper-border">
          <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 text-sm text-white/40 [html.light_&]:text-ink-2/40 card-surface rounded-xl px-3 py-2 w-72 hover:border-growth-500/30">
            <SearchIcon size={16} /> Search careers, skills, resources…
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/50 [html.light_&]:text-ink-2/50">{user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-growth-500/20 text-growth-400 flex items-center justify-center text-xs font-semibold">
              {(user?.name || user?.email || "?").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </div>
        <div className="px-4 lg:px-8 py-6 pt-20 lg:pt-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
