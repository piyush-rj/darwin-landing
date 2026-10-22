import type { ReactNode } from "react";

import CtaSection from "@/components/new-landing/CtaSection";
import NewLandingFooter from "@/components/new-landing/NewLandingFooter";
import NewLandingNavbar from "@/components/new-landing/NewLandingNavbar";
import LenisProvider from "@/providers/LenisProvider";

export default function LandingPageShell({
    ctaTone,
    ctaText,
    children,
}: {
    ctaTone?: string;
    ctaText?: string;
    children: ReactNode;
}) {
    return (
        <LenisProvider>
            <main
                data-landing-root
                suppressHydrationWarning
                className="theme-light min-h-screen w-full bg-ink text-foreground"
            >
                <div className="[--color-edge:color-mix(in_oklab,var(--color-foreground)_12%,var(--color-snow))]">
                    <NewLandingNavbar />
                    {children}
                    <CtaSection tone={ctaTone} text={ctaText}>
                        <NewLandingFooter />
                    </CtaSection>
                </div>
            </main>
        </LenisProvider>
    );
}
