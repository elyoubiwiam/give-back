import { lazy, Suspense, type ComponentProps } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type TaskMapType from "./TaskMap";

const TaskMap = lazy(() => import("./TaskMap"));

export function LazyMap(props: ComponentProps<typeof TaskMapType>) {
  const fallback = <div className="animate-pulse rounded-3xl bg-muted" style={{ height: props.height ?? 480 }} />;
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <TaskMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}
