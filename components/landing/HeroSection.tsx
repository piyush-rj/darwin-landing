import Link from "next/link";

import { BreadcrumbSeparatorIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

import HeroPanel from "./hero/HeroPanel";
import IssueTrackerWindow from "./hero/IssueTrackerWindow";
import PullRequestWindow from "./hero/PullRequestWindow";
import JoinWaitlistButton from "./JoinWaitlistButton";
import LetterDropHeadline from "./LetterDropHeadline";
import { PAGE_CONTAINER } from "./pageContainer";

const PANEL_ACTION = "h-10 px-5 text-[15px]";

export default function HeroSection() {
    return (
        <section className="pt-36 pb-24 md:pt-[184px] md:pb-32">
            <div className={cn(PAGE_CONTAINER, "flex flex-col items-center text-center")}>
                <Link
                    href="/changelog"
                    className="group inline-flex items-center gap-1 text-[14px] tracking-[-0.01em] text-stone-500 transition-colors hover:text-stone-900"
                >
                    New: TypeScript repos are live
                    <BreadcrumbSeparatorIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <LetterDropHeadline
                    lines={[{ text: "Issues in." }, { text: "Pull requests out.", magic: true }]}
                    className="mt-5 font-editorial text-[42px] leading-[1.15] font-medium tracking-[-0.03em] sm:text-[60px] lg:text-[76px]"
                />
            </div>

            <div
                className={cn(
                    PAGE_CONTAINER,
                    "mt-20 grid gap-16 md:mt-[120px] lg:grid-cols-2 lg:gap-8",
                )}
            >
                <HeroPanel
                    eyebrow="Issues in"
                    title="Your team files them as usual"
                    action={<JoinWaitlistButton className={PANEL_ACTION} />}
                >
                    <IssueTrackerWindow />
                </HeroPanel>
                <HeroPanel
                    eyebrow="Pull requests out"
                    title="Darwin ships the fix that passes"
                    action={
                        <Link
                            href="/how-it-works"
                            className={cn(
                                PANEL_ACTION,
                                "inline-flex items-center rounded-full bg-stone-950 font-medium tracking-[-0.01em] text-paper transition-colors hover:bg-stone-800",
                            )}
                        >
                            How it works
                        </Link>
                    }
                >
                    <PullRequestWindow />
                </HeroPanel>
            </div>
        </section>
    );
}
