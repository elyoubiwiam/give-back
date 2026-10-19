import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

const NAV = [
  { to: "/tasks", label: "Tasks" },
  { to: "/community", label: "Community" },
  { to: "/rewards", label: "Rewards" },
  { to: "/donate", label: "Donate" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <Heart className="h-4 w-4" fill="currentColor" />
          </span>
          GiveBack
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/profile"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          My profile
        </Link>
      </div>
      <nav className="flex justify-center gap-1 border-t border-border/60 px-2 py-2 md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground" activeProps={{ className: "bg-secondary text-foreground" }}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
