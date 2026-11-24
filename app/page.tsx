import FloatingNavbar from "@/components/redesign/FloatingNavbar";
import Footer from "@/components/redesign/Footer";
import HeroSection from "@/components/redesign/hero/HeroSection";
import HowItWorksSection from "@/components/redesign/HowItWorksSection";
import InsideDarwinSection from "@/components/redesign/InsideDarwinSection";
import StickyNotesSection from "@/components/redesign/notes/StickyNotesSection";
import StackSecuritySection from "@/components/redesign/stack/StackSecuritySection";
import LenisProvider from "@/providers/LenisProvider";

export default function Home() {
    return (
        <LenisProvider>
            <div className="w-full font-body text-stone-950">
                <FloatingNavbar />
                <main className="relative z-10 min-h-screen overflow-x-clip bg-paper">
                    <HeroSection />
                    <StickyNotesSection />
                    <HowItWorksSection />
                    <InsideDarwinSection />
                    <StackSecuritySection />
                    <div
                        id="footer-reveal"
                        aria-hidden
                        className="pointer-events-none absolute bottom-0 h-px w-px"
                    />
                </main>
                <Footer />
            </div>
        </LenisProvider>
    );
}
