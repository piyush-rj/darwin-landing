import { create } from "zustand";
import { persist } from "zustand/middleware";

import { LANDING_THEME_STORAGE_KEY, type LandingTheme } from "@/lib/landingTheme";

interface LandingThemeState {
    theme: LandingTheme;
    toggleTheme: () => void;
}

export const useLandingThemeStore = create<LandingThemeState>()(
    persist(
        (set) => ({
            theme: "light",
            toggleTheme: () =>
                set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
        }),
        {
            name: LANDING_THEME_STORAGE_KEY,
            skipHydration: true,
            partialize: (state) => ({ theme: state.theme }),
        },
    ),
);
