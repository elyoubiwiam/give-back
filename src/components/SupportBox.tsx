import { Check } from "lucide-react";

export function SupportBox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition ${checked ? "border-primary bg-primary/10" : "border-dashed border-border"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="text-sm">
        <span className="font-medium text-foreground">Donate to GiveBack to keep the service rolling</span>
        <span className="block text-muted-foreground">Optional. GiveBack is free — you choose the amount later.</span>
      </span>
    </label>
  );
}
