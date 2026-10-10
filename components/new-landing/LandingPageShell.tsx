import type { ReactNode } from "react";

import CtaSection from "@/components/new-landing/CtaSection";
import LandingThemeGuard from "@/components/new-landing/LandingThemeGuard";
import NewLandingFooter from "@/components/new-landing/NewLandingFooter";
import NewLandingNavbar from "@/components/new-landing/NewLandingNavbar";
import LenisProvider from "@/providers/LenisProvider";

export default function LandingPageShell({ children }: { children: ReactNode }) {
    return (
        <LenisProvider>
            <main
                data-landing-root
                suppressHydrationWarning
                className="theme-light min-h-screen w-full bg-ink text-foreground"
            >
                <LandingThemeGuard />
                <div className="[--color-edge:color-mix(in_oklab,var(--color-foreground)_12%,var(--color-snow))]">
                    <NewLandingNavbar />
                    {children}
                    <CtaSection>
                        <NewLandingFooter />
                    </CtaSection>
                </div>
            </main>
        </LenisProvider>
    );
}
