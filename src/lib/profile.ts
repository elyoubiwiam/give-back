import { useEffect, useState } from "react";
import type { Cause, City } from "./data";

// Preview-only profile stored on this device. Real accounts will replace this later.
export type Profile = {
  name: string;
  city: City;
  causes: Cause[];
  skills: string[];
  maxMinutes: number;
  points: number;
};

export const DEFAULT_PROFILE: Profile = {
  name: "",
  city: "London",
  causes: [],
  skills: [],
  maxMinutes: 120,
  points: 185,
};

const KEY = "giveback-profile";

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [hasProfile, setHasProfile] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
        setHasProfile(true);
      }
    } catch {}
  }, []);
  const save = (p: Profile) => {
    setProfile(p);
    setHasProfile(true);
    localStorage.setItem(KEY, JSON.stringify(p));
  };
  return { profile, hasProfile, save };
}
