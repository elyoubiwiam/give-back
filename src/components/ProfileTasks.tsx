import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { tasksQuery } from "@/lib/queries";
import { formatMinutes } from "@/lib/data";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";

export function ProfileTasks() {
  const { joined } = useAuth();
  const { data: tasks } = useSuspenseQuery(tasksQuery);
  const booked = tasks.filter((task) => joined.has(task.id)).sort((a, b) => (a.starts_at ?? "").localeCompare(b.starts_at ?? ""));
  const minutes = booked.reduce((total, task) => total + task.minutes, 0);
  const points = booked.reduce((total, task) => total + task.points, 0);

  return (
    <section className="mt-10 border-t border-border pt-8" aria-labelledby="my-tasks-heading">
      <h2 id="my-tasks-heading" className="text-xl font-semibold text-foreground">Your booked tasks</h2>
      <dl className="my-5 grid grid-cols-3 gap-3 text-sm">
        <div><dt className="text-muted-foreground">Tasks</dt><dd className="mt-1 text-xl font-semibold">{booked.length}</dd></div>
        <div><dt className="text-muted-foreground">Time committed</dt><dd className="mt-1 text-xl font-semibold">{formatMinutes(minutes)}</dd></div>
        <div><dt className="text-muted-foreground">Task points</dt><dd className="mt-1 text-xl font-semibold">{points}</dd></div>
      </dl>
      {booked.length ? (
        <div className="grid gap-4 sm:grid-cols-2">{booked.map((task) => <TaskCard key={task.id} task={task} compact />)}</div>
      ) : (
        <div className="space-y-3 py-4">
          <p className="text-sm text-muted-foreground">No tasks booked yet.</p>
          <Button asChild><Link to="/tasks">Find a task</Link></Button>
        </div>
      )}
    </section>
  );
}