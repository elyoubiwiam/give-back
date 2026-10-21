import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { BarChart3, ClipboardList, Building2 } from "lucide-react";
import { currentUserHasRole } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/charity")({
  beforeLoad: async () => {
    if (!(await currentUserHasRole("charity"))) throw redirect({ to: "/" });
  },
  component: CharityLayout,
});

const NAV = [
  { to: "/charity", label: "Dashboard", icon: BarChart3 },
  { to: "/charity/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/charity/profile", label: "Profile", icon: Building2 },
] as const;

function CharityLayout() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <nav className="mb-8 flex flex-wrap gap-2">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            activeProps={{ className: "!border-primary bg-primary/10 !text-foreground font-medium" }}>
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
