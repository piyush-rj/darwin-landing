import ControlSection from "@/components/redesign/ControlSection";
import FloatingNavbar from "@/components/redesign/FloatingNavbar";
import Footer from "@/components/redesign/Footer";
import BacklogGlobeSection from "@/components/redesign/globe/BacklogGlobeSection";
import HeroSection from "@/components/redesign/hero/HeroSection";
import HowItWorksSection from "@/components/redesign/HowItWorksSection";
import InsideDarwinSection from "@/components/redesign/InsideDarwinSection";
import PerforatedEdge from "@/components/redesign/PerforatedEdge";
import StackSecuritySection from "@/components/redesign/stack/StackSecuritySection";
import LenisProvider from "@/providers/LenisProvider";

export default function Home() {
    return (
        <LenisProvider>
            <div className="landing-redesign w-full font-body text-stone-950">
                <FloatingNavbar />
                <main className="relative z-10 min-h-screen overflow-x-clip bg-paper">
                    <HeroSection />
                    <BacklogGlobeSection />
                    <PerforatedEdge sides={["top", "bottom"]}>
                        <HowItWorksSection />
                    </PerforatedEdge>
                    <InsideDarwinSection />
                    <ControlSection />
                    <PerforatedEdge sides={["top"]}>
                        <StackSecuritySection />
                    </PerforatedEdge>
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
