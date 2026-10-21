import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function JoinCTA({ title = "Get tasks matched to your causes and your time. Free", compact = false }: { title?: string; compact?: boolean }) {
  const { user, loading } = useAuth();
  if (loading || user) return null;
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-plum text-primary-foreground ${compact ? "p-5" : "p-8 md:p-10"}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-mustard/50" />
      <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm opacity-80"><Sparkles className="h-4 w-4" /> Free, always</p>
          <h3 className={`mt-1 font-semibold ${compact ? "text-lg" : "text-2xl"}`}>{title}</h3>
          {!compact && <p className="mt-1 text-sm opacity-85">Create an account to have tasks tailored to the causes you care about.</p>}
        </div>
        <Link to="/auth" search={{ mode: "signup" }} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary-foreground px-5 py-3 font-medium text-plum transition hover:scale-105">
          Create your free account <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
