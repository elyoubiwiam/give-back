import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/tasks", label: "Tasks" },
  { to: "/map", label: "Map" },
  { to: "/community", label: "Cities" },
  { to: "/rewards", label: "Rewards" },
  { to: "/donate", label: "Donate" },
] as const;

export function SiteHeader() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-[1000] border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground transition-transform hover:rotate-12">
            <Heart className="h-4 w-4" fill="currentColor" />
          </span>
          GiveBack
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "bg-secondary !text-foreground font-medium" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="flex items-center gap-2">
            <Link to="/rewards" className="hidden items-center gap-1 rounded-full bg-mustard/20 px-3 py-1.5 text-sm font-semibold text-foreground sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> {profile?.points ?? 0}
            </Link>
            <Link to="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-plum font-semibold text-primary-foreground" title="My profile">
              {(profile?.name || user.email || "?")[0]?.toUpperCase()}
            </Link>
            <button onClick={signOut} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link to="/auth" className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-105">
            Sign in
          </Link>
        )}
      </div>
      <nav className="flex justify-center gap-1 overflow-x-auto border-t border-border/60 px-2 py-2 md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground" activeProps={{ className: "bg-secondary !text-foreground" }}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
