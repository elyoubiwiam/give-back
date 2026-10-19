import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { causeMeta, formatMinutes, type Task } from "@/lib/data";

function pin(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,.25)"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center[0], center[1], zoom]);
  return null;
}

export default function TaskMap({
  tasks,
  center,
  zoom = 12,
  height = 480,
  onJoin,
}: {
  tasks: Task[];
  center: [number, number];
  zoom?: number;
  height?: number;
  onJoin?: (t: Task) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} zoom={zoom} />
        {tasks.map((t) => {
          const color = getComputedStyle(document.documentElement).getPropertyValue(causeMeta(t.cause).color.slice(4, -1)).trim();
          return (
            <Marker key={t.id} position={[t.lat, t.lng]} icon={pin(color || "#c96a3d")}>
              <Popup>
                <div style={{ fontFamily: "Poppins, sans-serif", minWidth: 180 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color }}>{t.cause}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{t.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{t.org} · {formatMinutes(t.minutes)} · {t.when_label}</div>
                  {onJoin && (
                    <button
                      onClick={() => onJoin(t)}
                      style={{ marginTop: 8, width: "100%", padding: "6px 10px", borderRadius: 999, background: color, color: "white", fontWeight: 600, fontSize: 12 }}
                    >
                      Lend a hand · {t.points} pts
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
