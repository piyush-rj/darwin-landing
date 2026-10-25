import Image from "next/image";

import { CheckIcon } from "@/components/icons";
import { DARWIN_LOGO_BRAND_COLOR, DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import FadeIn from "@/components/new-landing/FadeIn";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import RollingText from "@/components/utility/RollingText";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { TerminalGlyph } from "../PixelGlyphs";
import { CardShell, META, PanelTag } from "../problem/ComparisonParts";
import StatusBlock from "../StatusBlock";

const DARWIN_CHIP =
    "inline-flex h-5 items-center gap-1 border border-violet-500/30 bg-violet-500/10 px-1.5 font-mono text-[9.5px] tracking-[0.1em] text-violet-600 uppercase";
const YOU_CHIP =
    "inline-flex h-5 items-center border border-foreground/15 bg-mist px-1.5 font-mono text-[9.5px] tracking-[0.1em] text-neutral-500 uppercase";

function MockRow({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                "flex h-[42px] items-center gap-2.5 border-b border-dashed border-edge last:border-b-0",
                className,
            )}
        >
            {children}
        </div>
    );
}

function LongTailMock() {
    return (
        <>
            <MockRow>
                <StatusBlock status={KanbanStatus.InProgress} className="size-3.5 shrink-0" />
                <span className="truncate text-[14px] text-foreground">Payments migration</span>
                <span className="ml-auto shrink-0 overflow-hidden rounded-sm border border-edge">
                    <Image
                        src="/images/team/piyush.png"
                        alt=""
                        width={20}
                        height={20}
                        className="size-5 scale-[1.3] object-cover object-[50%_40%]"
                    />
                </span>
            </MockRow>
            <MockRow className="opacity-70">
                <StatusBlock status={KanbanStatus.Todo} className="size-3.5 shrink-0" />
                <span className="truncate text-[14px] text-foreground">Rounding bug</span>
                <span className={cn(META, "ml-auto shrink-0")}>open 41d</span>
            </MockRow>
            <MockRow className="opacity-45">
                <StatusBlock status={KanbanStatus.Todo} className="size-3.5 shrink-0" />
                <span className="truncate text-[14px] text-foreground">Avatar 404s on Safari</span>
                <span className={cn(META, "ml-auto shrink-0")}>open 33d</span>
            </MockRow>
            <MockRow>
                <DarwinBlockLogo className={cn("size-4 shrink-0", DARWIN_LOGO_BRAND_COLOR)} />
                <span className="truncate text-[14px] text-foreground">
                    Darwin takes the long tail
                </span>
                <span className={cn(META, "ml-auto shrink-0 text-violet-600")}>
                    3 closed overnight
                </span>
            </MockRow>
        </>
    );
}

const LOOP_STEPS = [
    "Explain the issue",
    "Review what it wrote",
    "Run it locally",
    "Open the pull request",
];

function LoopMock() {
    return (
        <>
            {LOOP_STEPS.map((step) => (
                <MockRow key={step}>
                    <span className="size-1.5 shrink-0 bg-neutral-300" />
                    <span className="truncate text-[14px] text-foreground/80">{step}</span>
                    <span className={cn(YOU_CHIP, "ml-auto shrink-0")}>you</span>
                </MockRow>
            ))}
            <MockRow>
                <span className="size-1.5 shrink-0 bg-violet-500" />
                <span className="truncate text-[14px] text-foreground">
                    The whole loop, sandbox to proof
                </span>
                <span className={cn(DARWIN_CHIP, "ml-auto shrink-0")}>
                    <DarwinBlockLogo className={cn("size-3", DARWIN_LOGO_BRAND_COLOR)} />
                    darwin
                </span>
            </MockRow>
        </>
    );
}

const CAPABILITIES = [
    { label: "Takes GitHub issues", copilot: true },
    { label: "Starts from its own board", copilot: false },
    { label: "Re-runs the failing test, old vs new", copilot: false },
    { label: "UI changes shown side by side", copilot: false },
];

function CapabilityMock() {
    return (
        <>
            <div className="flex h-8 items-center border-b border-edge">
                <span className={cn(META, "mr-auto")}>capability</span>
                <span className={cn(META, "w-16 text-center")}>copilot</span>
                <span className={cn(META, "w-16 text-center text-violet-600")}>darwin</span>
            </div>
            {CAPABILITIES.map((capability) => (
                <MockRow key={capability.label}>
                    <span className="truncate text-[14px] text-foreground/80">
                        {capability.label}
                    </span>
                    <span className="ml-auto flex w-16 shrink-0 justify-center">
                        {capability.copilot ? (
                            <CheckIcon className="size-3.5 text-foreground/60" aria-hidden />
                        ) : (
                            <span className="text-[13px] text-neutral-300">—</span>
                        )}
                    </span>
                    <span className="flex w-16 shrink-0 justify-center">
                        <CheckIcon className="size-3.5 text-violet-600" aria-hidden />
                    </span>
                </MockRow>
            ))}
        </>
    );
}

function UnitOfWorkMock() {
    return (
        <>
            <div className="flex items-center gap-2 pt-1">
                <span className={YOU_CHIP}>chat</span>
                <span className={cn(META, "normal-case")}>the ask, somewhere in a thread</span>
            </div>
            <div className="mt-2.5 rounded-md border border-edge bg-mist/70 px-3.5 py-2.5 text-[13.5px] text-neutral-400">
                Can you fix the rounding thing when you get a chance?
            </div>
            <div className="mt-5 flex items-center gap-2">
                <span className={DARWIN_CHIP}>board</span>
                <span className={cn(META, "normal-case")}>the same ask, as a unit of work</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2.5 border border-edge bg-snow px-3.5 py-2.5">
                <StatusBlock status={KanbanStatus.Done} className="size-3.5 shrink-0" />
                <span className="font-mono text-[10.5px] text-neutral-400">NOC-142</span>
                <span className="truncate text-[14px] text-foreground">Checkout rounds wrong</span>
                <span className={cn(META, "ml-auto shrink-0 text-violet-600")}>
                    PR #910 · proof
                </span>
            </div>
        </>
    );
}

const FILERS = [
    { label: "Priya", sub: "PM" },
    { label: "Sam", sub: "QA" },
    { label: "#eng-bugs", sub: "Slack" },
];

function FilersMock() {
    return (
        <>
            <div className="flex items-center gap-2 pt-1">
                <span className={YOU_CHIP}>cursor</span>
                <span className={cn(META, "normal-case")}>starts inside the editor</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2.5 rounded-md bg-foreground px-3.5 py-2.5">
                <TerminalGlyph className="size-4 text-white/60" />
                <span className="font-mono text-[12px] text-white/70">
                    an engineer, mid-session, kicks it off
                </span>
            </div>
            <div className="mt-5 flex items-center gap-2">
                <span className={DARWIN_CHIP}>darwin</span>
                <span className={cn(META, "normal-case")}>anyone on the team files it</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
                {FILERS.map((filer) => (
                    <span
                        key={filer.label}
                        className="flex items-center gap-1.5 border border-edge bg-snow px-2.5 py-1.5"
                    >
                        <span className="text-[13px] text-foreground">{filer.label}</span>
                        <span className={cn(META, "text-[9.5px]")}>{filer.sub}</span>
                    </span>
                ))}
                <span className="flex items-center gap-1.5 border border-edge bg-snow px-2.5 py-1.5">
                    <span className="text-[13px] text-foreground">Telegram</span>
                    <span className={cn(META, "text-[9.5px]")}>+ Discord</span>
                </span>
            </div>
        </>
    );
}

const MODELS = [
    { name: "Claude Code", issue: "runs NOC-142", active: true },
    { name: "Codex", issue: "runs NOC-138", active: true },
    { name: "OpenCode", issue: "per project", active: false },
];

function ModelPickerMock() {
    return (
        <>
            <div className="flex h-8 items-center border-b border-edge">
                <span className={cn(META, "mr-auto")}>coding agent</span>
                <span className={META}>chosen per issue</span>
            </div>
            {MODELS.map((model) => (
                <MockRow key={model.name}>
                    <span
                        className={cn(
                            "size-2 shrink-0 border",
                            model.active
                                ? "border-violet-500 bg-violet-500"
                                : "border-neutral-300 bg-transparent",
                        )}
                    />
                    <span
                        className={cn(
                            "text-[14px]",
                            model.active ? "text-foreground" : "text-neutral-400",
                        )}
                    >
                        {model.name}
                    </span>
                    <span className={cn(META, "ml-auto shrink-0")}>{model.issue}</span>
                </MockRow>
            ))}
        </>
    );
}

type Alternative = {
    id: string;
    name: string;
    tag: string;
    headline: string;
    caption: string;
    mock: React.ReactNode;
};

const ALTERNATIVES: Alternative[] = [
    {
        id: "yourself",
        name: "Doing it yourself",
        tag: "The long tail",
        headline: "Your engineers can fix it. They just can't fix all of it.",
        caption: "The big work gets an owner. The long tail waits for a free afternoon.",
        mock: <LongTailMock />,
    },
    {
        id: "claude",
        name: "You + Claude",
        tag: "The loop",
        headline: "Claude writes the code. You still do everything around it.",
        caption: "The code was never the whole job — the loop around it is.",
        mock: <LoopMock />,
    },
    {
        id: "copilot",
        name: "Copilot coding agent",
        tag: "GitHub only",
        headline: "Built for teams that live entirely in GitHub.",
        caption: "You assign a GitHub issue and get a draft pull request back.",
        mock: <CapabilityMock />,
    },
    {
        id: "devin",
        name: "Devin",
        tag: "Chat first",
        headline: "A general-purpose engineer you talk to.",
        caption: "Work described in chat stays a conversation. An issue stays accountable.",
        mock: <UnitOfWorkMock />,
    },
    {
        id: "cursor",
        name: "Cursor background agents",
        tag: "Editor first",
        headline: "Agents that start from the editor.",
        caption: "Powerful when an engineer is already in the code. Most issues start elsewhere.",
        mock: <FilersMock />,
    },
    {
        id: "codex",
        name: "OpenAI Codex",
        tag: "One model",
        headline: "One model family, in the cloud.",
        caption: "Darwin runs Codex too — or Claude Code, or OpenCode.",
        mock: <ModelPickerMock />,
    },
];

function AlternativeCard({ alternative }: { alternative: Alternative }) {
    return (
        <div className="relative isolate overflow-hidden border border-edge bg-[color-mix(in_oklab,var(--color-foreground)_6%,var(--color-snow))] px-6 py-10 md:px-12 md:py-14">
            <div className="grain-strong pointer-events-none absolute inset-0 -z-10 opacity-20" />
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
                <FadeIn>
                    <div className="flex items-center gap-2">
                        <PanelTag>{alternative.name}</PanelTag>
                        <PanelTag>{alternative.tag}</PanelTag>
                    </div>
                    <h3 className="mt-6 max-w-[22ch] text-[27px] leading-[1.14] font-semibold tracking-[-0.025em] text-foreground sm:text-[30px]">
                        {alternative.headline}
                    </h3>
                    <p className="mt-3 max-w-[46ch] text-[16px] leading-[1.5] text-neutral-500">
                        {alternative.caption}
                    </p>
                </FadeIn>
                <FadeIn delay={0.12}>
                    <CardShell className="bg-snow/45">
                        <div className="pb-2">{alternative.mock}</div>
                    </CardShell>
                </FadeIn>
            </div>
        </div>
    );
}

export default function CompareSection() {
    return (
        <section id="compare" className="w-full border-b border-edge bg-ink">
            <div className="grid w-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
                <div className="px-6 pt-16 pb-12 md:px-9 lg:pt-24 lg:pb-16">
                    <p className={MONO_LABEL}>Compare</p>
                    <h2 className="mt-5 max-w-[15ch] text-[44px] leading-[0.98] font-medium tracking-[-0.04em] text-foreground sm:text-[56px] lg:text-[68px]">
                        <RollingText text="Where Darwin fits." />
                    </h2>
                </div>
                <div className="flex items-end border-edge bg-mist px-6 py-10 max-lg:border-t md:px-9 lg:border-l">
                    <FadeIn delay={0.15}>
                        <p className="max-w-[30ch] text-[19px] leading-[1.35] tracking-[-0.01em] text-foreground">
                            Plenty of tools write code. Darwin takes the issue off your board and
                            comes back with the proof.
                        </p>
                    </FadeIn>
                </div>
            </div>

            <div className="flex flex-col gap-6 border-t border-edge px-6 py-12 md:px-9 lg:py-16">
                {ALTERNATIVES.map((alternative) => (
                    <AlternativeCard key={alternative.id} alternative={alternative} />
                ))}
            </div>
        </section>
    );
}
