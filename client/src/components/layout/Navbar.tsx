import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Briefcase, LogOut, Menu, Moon, Plus, Sun, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-brand-400",
    isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-600 dark:text-slate-300"
  );

export function Navbar() {
  const { user } = useAuthStore();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Briefcase className="h-[18px] w-[18px]" />
            </span>
            JobBoard
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/" end className={linkClass}>
              Find jobs
            </NavLink>
            {user?.role === "jobseeker" && (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                  My applications
                </NavLink>
                <NavLink to="/saved" className={linkClass}>
                  Saved jobs
                </NavLink>
              </>
            )}
            {user?.role === "employer" && (
              <NavLink to="/employer" className={linkClass}>
                Employer dashboard
              </NavLink>
            )}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-ring dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          {user ? (
            <>
              {user.role === "employer" && (
                <Button size="sm" onClick={() => navigate("/employer/jobs/new")}>
                  <Plus className="h-4 w-4" /> Post a job
                </Button>
              )}
              <Link
                to={user.role === "employer" ? "/employer/profile" : "/profile"}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-ring dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={signOut}
                aria-label="Sign out"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-ring dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300">
                Log in
              </Link>
              <Button size="sm" onClick={() => navigate("/register")}>
                Sign up
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 md:hidden dark:text-slate-300"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-4 md:hidden dark:border-slate-800 animate-slide-up">
          <nav className="flex flex-col gap-4">
            <NavLink to="/" end className={linkClass} onClick={() => setMobileOpen(false)}>
              Find jobs
            </NavLink>
            {user?.role === "jobseeker" && (
              <>
                <NavLink to="/dashboard" className={linkClass} onClick={() => setMobileOpen(false)}>
                  My applications
                </NavLink>
                <NavLink to="/saved" className={linkClass} onClick={() => setMobileOpen(false)}>
                  Saved jobs
                </NavLink>
                <NavLink to="/profile" className={linkClass} onClick={() => setMobileOpen(false)}>
                  Profile
                </NavLink>
              </>
            )}
            {user?.role === "employer" && (
              <>
                <NavLink to="/employer" className={linkClass} onClick={() => setMobileOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink to="/employer/jobs/new" className={linkClass} onClick={() => setMobileOpen(false)}>
                  Post a job
                </NavLink>
                <NavLink to="/employer/profile" className={linkClass} onClick={() => setMobileOpen(false)}>
                  Profile
                </NavLink>
              </>
            )}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <button onClick={toggleTheme} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Toggle theme
              </button>
              {user ? (
                <button onClick={signOut} className="flex items-center gap-2 text-sm text-red-600">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Log in
                  </Link>
                  <Link to="/register" className="text-sm font-medium text-brand-600">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
