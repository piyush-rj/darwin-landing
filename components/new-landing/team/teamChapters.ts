import type { StaticImageData } from "next/image";

import anjanPortrait from "@/public/images/team/founders/anjan.webp";
import anjanBoxed from "@/public/images/team/founders/anjan-boxed.webp";
import anjanHead from "@/public/images/team/founders/anjan-head.webp";
import piyushPortrait from "@/public/images/team/founders/piyush.webp";
import piyushBoxed from "@/public/images/team/founders/piyush-boxed.webp";
import piyushHead from "@/public/images/team/founders/piyush-head.webp";
import rishiPortrait from "@/public/images/team/founders/rishi.webp";
import rishiBoxed from "@/public/images/team/founders/rishi-boxed.webp";
import rishiHead from "@/public/images/team/founders/rishi-head.webp";

export type PortraitFraming = { zoom: number; anchorY: number };

export type TeamChapter = {
    key: string;
    name: string;
    title: string;
    role: string;
    tone: string;
    portrait: StaticImageData;
    boxedPortrait: StaticImageData;
    rosterFraming?: PortraitFraming;
    head: StaticImageData;
    about: string;
    xHandle: string;
    hoverLines: string[];
};

export const TEAM_CHAPTERS: TeamChapter[] = [
    {
        key: "rishi",
        xHandle: "khairrishi",
        about: "Rishi started Darwin with one idea: a teammate that picks an issue off the board and comes back with a pull request. He writes across the whole stack, from the board you file issues on to the runners that fix them, and owns every call in between.",
        hoverLines: [
            "psst. you're hovering the founder.",
            "rishi here. i filed issue #1.",
            "this whole page? started as a todo.",
            "your backlog's next. join the waitlist.",
        ],
        name: "Rishi Kant",
        title: "Founder",
        role: "Founder & CEO",
        tone: "var(--color-primary)",
        portrait: rishiPortrait,
        boxedPortrait: rishiBoxed,
        head: rishiHead,
        rosterFraming: { zoom: 1.12, anchorY: 1 },
    },
    {
        key: "piyush",
        xHandle: "piyushc2p",
        about: "Piyush shapes everything you touch in Darwin. He takes what Rishi and Anjan build and turns it into something that feels obvious, from the board and the review screens to this very page. Every spacing, motion and state passes through him before it ships.",
        hoverLines: [
            "easy there. fresh paint.",
            "piyush here. i decide how darwin feels.",
            "the boxy me? yeah, also my idea.",
            "ok you can stop staring now.",
        ],
        name: "Piyush Raj",
        title: "Co-founder",
        role: "Co-founder · Frontend & Design",
        tone: "var(--color-orange-500)",
        portrait: piyushPortrait,
        boxedPortrait: piyushBoxed,
        head: piyushHead,
    },
    {
        key: "anjan",
        xHandle: "anjanstwt",
        about: "Anjan built the part of Darwin you never see. Every issue you file travels through his queues, waits for a free runner and gets fixed inside a sandbox he designed. He keeps every run isolated, observable and fast, so fixes keep landing while you sleep.",
        hoverLines: [
            "whoa, careful. that's production.",
            "anjan here. i keep darwin awake.",
            "if it breaks, it was dns. always dns.",
            "now stop hovering, you're adding load.",
        ],
        name: "Anjan Suman",
        title: "Co-founder",
        role: "Co-founder · Backend & Infra",
        tone: "var(--color-sky-500)",
        portrait: anjanPortrait,
        boxedPortrait: anjanBoxed,
        head: anjanHead,
    },
];
