"use client";

import dynamic from "next/dynamic";

import SectionHeader from "./SectionHeader";

const ControlScene = dynamic(() => import("./control-scene/ControlScene"), { ssr: false });

export default function ControlSection() {
    return (
        <section
            aria-labelledby="control-title"
            className="w-full bg-paper px-4 pt-24 md:px-8 md:pt-36"
        >
            <div className="mx-auto max-w-page">
                <SectionHeader
                    label="You stay in control"
                    titleId="control-title"
                    title="It pins the work. You lay the stone."
                    description="Darwin never pushes to main. Every fix arrives as a pull request with its tests passing, and waits on the wall until someone on your team reviews and merges it."
                />
                <div className="mt-12 overflow-hidden mask-t-from-85% mask-b-from-80% md:mt-10">
                    <div
                        role="img"
                        aria-label="Darwin sits back in a chair sipping coffee while its pull requests hang pinned to an old stone wall."
                        className="relative aspect-[1916/821] w-[160%] -translate-x-[31%] md:w-full md:translate-x-0"
                    >
                        <ControlScene />
                    </div>
                </div>
            </div>
        </section>
    );
}
