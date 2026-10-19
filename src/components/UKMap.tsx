import { CITIES, CITY_CENTERS, type City, type Task } from "@/lib/data";

const GB: [number, number][] = [
  [-5.7, 50.05], [-5.0, 50.0], [-4.2, 50.35], [-3.5, 50.3], [-3.0, 50.7], [-2.0, 50.6], [-1.3, 50.75], [0.0, 50.75],
  [1.0, 51.0], [1.4, 51.35], [0.9, 51.55], [1.7, 52.1], [1.75, 52.7], [1.3, 52.95], [0.4, 52.95], [0.1, 53.4],
  [-0.2, 53.75], [-0.6, 54.45], [-1.2, 54.7], [-1.6, 55.6], [-2.0, 55.9], [-2.7, 56.05], [-2.6, 56.3], [-2.0, 57.0],
  [-1.8, 57.6], [-2.5, 57.7], [-3.6, 57.65], [-4.0, 57.85], [-3.1, 58.6], [-4.5, 58.55], [-5.0, 58.6], [-5.3, 58.2],
  [-5.8, 57.8], [-5.6, 57.3], [-5.8, 56.8], [-5.5, 56.3], [-5.7, 55.4], [-5.0, 55.0], [-5.1, 54.65], [-4.4, 54.8],
  [-3.6, 54.9], [-3.2, 54.4], [-3.0, 53.9], [-3.0, 53.35], [-4.1, 53.3], [-4.6, 53.25], [-4.4, 52.8], [-4.0, 52.5],
  [-4.1, 52.0], [-5.2, 51.85], [-5.0, 51.6], [-4.2, 51.55], [-3.2, 51.4], [-2.7, 51.55], [-3.1, 51.2], [-4.2, 51.2],
  [-4.6, 50.95], [-5.0, 50.6],
];
const NI: [number, number][] = [
  [-5.5, 54.3], [-5.8, 54.6], [-6.0, 55.2], [-6.6, 55.2], [-7.3, 55.1], [-7.6, 54.6], [-8.1, 54.4], [-7.3, 54.1], [-6.3, 54.0],
];

const K = 60;
const project = ([lon, lat]: [number, number]): [number, number] => [(lon + 8.5) * 0.574 * K, (59 - lat) * K];
const toPath = (pts: [number, number][]) => "M" + pts.map((p) => project(p).map((n) => n.toFixed(1)).join(",")).join("L") + "Z";
const GB_PATH = toPath(GB);
const NI_PATH = toPath(NI);

export function UKMap({
  tasks,
  selected,
  onSelect,
  className = "",
}: {
  tasks: Task[];
  selected: City;
  onSelect: (c: City) => void;
  className?: string;
}) {
  const counts = Object.fromEntries(CITIES.map((c) => [c, tasks.filter((t) => t.city === c).length]));
  return (
    <div className={`rounded-3xl bg-teal/15 p-4 ${className}`}>
      <svg viewBox="0 0 360 560" className="h-full w-full" role="img" aria-label="Map of UK cities with volunteering tasks">
        <path d={GB_PATH} fill="var(--card)" stroke="var(--border)" strokeWidth={2} strokeLinejoin="round" />
        <path d={NI_PATH} fill="var(--card)" stroke="var(--border)" strokeWidth={2} strokeLinejoin="round" />
        {CITIES.map((c) => {
          const [x, y] = project([CITY_CENTERS[c][1], CITY_CENTERS[c][0]]);
          const r = 8 + Math.min(10, (counts[c] ?? 0) * 2);
          const on = c === selected;
          const labelLeft = c === "Glasgow";
          return (
            <g key={c} onClick={() => onSelect(c)} className="cursor-pointer" role="button" aria-label={`${c}, ${counts[c]} tasks`}>
              <circle cx={x} cy={y} r={r} fill={on ? "var(--primary)" : "var(--coral)"} opacity={0.25}>
                <animate attributeName="r" values={`${r};${r + 8};${r}`} dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r={r * 0.6} fill={on ? "var(--primary)" : "var(--coral)"} stroke="var(--card)" strokeWidth={3} className="transition-all" />
              <text
                x={labelLeft ? x - r - 4 : x + r + 4}
                y={y + 4}
                textAnchor={labelLeft ? "end" : "start"}
                fontSize={on ? 15 : 13}
                fontWeight={on ? 700 : 500}
                fill="var(--foreground)"
                fontFamily="Poppins, sans-serif"
              >
                {c} · {counts[c]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
