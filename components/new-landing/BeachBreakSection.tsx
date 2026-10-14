import PixelSprite, { type PixelSpriteArt } from "@/components/new-landing/PixelSprite";
import PixelStrip from "@/components/new-landing/PixelStrip";

const SPRITE_SCALE = 6;

const SKIN = { s: "#f2b38a", d: "#d9906a" };

const GUY_WITH_LAPTOP: PixelSpriteArt = {
    rows: [
        "............................hhhhhh........",
        "...........................hhhhhhh........",
        "...........................hhsssss........",
        "...........................hheeeee........",
        "...........................hhsseee.....gl.",
        "............................sssssd.....gl.",
        "............................ssssss.....gl.",
        "..........................tttss.......gl..",
        "........................ttttss........gl..",
        ".........ssssssbbbbbttttttttss........gl..",
        ".........ssssssbbbbbttttttttsssssss...gl..",
        ".........ddddddBBBBBTTTTTTTTdddddkkkkkkk..",
        "yywwyywwyywwyywwyywwyywwyywwyywwyywwyywwyy",
        "yywwyywwyywwyywwyywwyywwyywwyywwyywwyywwyy",
    ],
    colors: {
        ...SKIN,
        h: "#3f2a1d",
        e: "#18181b",
        b: "#3b82f6",
        B: "#2563eb",
        t: "#1e3a8a",
        T: "#172554",
        k: "#71717a",
        l: "#a1a1aa",
        g: "#93c5fd",
        y: "#fde047",
        w: "#ffffff",
    },
};

const LEG_RAISED: PixelSpriteArt = {
    rows: ["...ss.", "..dss.", "....sd", "....sd", "....sd", "....sd", "....sd"],
    colors: SKIN,
};

const LEG_SWUNG: PixelSpriteArt = {
    rows: [".ss...", "dss...", "..sd..", "..sd..", "...sd.", "...sd.", "....sd"],
    colors: SKIN,
};

const UMBRELLA: PixelSpriteArt = {
    rows: [
        "...........p...........",
        "..........nnn..........",
        ".......wwwnnnwww.......",
        ".....nnwwwnnnwwwnn.....",
        "...wnnnwwwnnnwwwnnnw...",
        "..wwnnnwwwnnnwwwnnnww..",
        ".wwwnnnwwwnnnwwwnnnwww.",
        ".wwwnnnwwwnnnwwwnnnwww.",
        "nwwwnnnwwwnnnwwwnnnwwwn",
        "nwwwnnnwwwnnnwwwnnnwwwn",
        "nwwwnnnwwwnnnwwwnnnwwwn",
        "NWWWNNNWWWNNNWWWNNNWWWN",
        "..W..N..W..p..W..N..W..",
        "...........p...........",
        "...........p...........",
        "...........p...........",
        "...........p...........",
        "...........p...........",
        "...........p...........",
        "...........p...........",
        "...........p...........",
        "...........p...........",
        "...........p...........",
        "...........p...........",
        "...........p...........",
        "...........p...........",
    ],
    colors: { n: "#dc2626", N: "#b91c1c", w: "#f97316", W: "#ea580c", p: "#71717a" },
};

const UMBRELLA_SHADOW: PixelSpriteArt = {
    rows: [
        "....ssssssssssssssssssssssssssss....",
        "ssssssssssssssssssssssssssssssssssss",
        "....ssssssssssssssssssssssssssss....",
    ],
    colors: { s: "#f2d77a" },
};

const SUN: PixelSpriteArt = {
    rows: [
        "...yyyy...",
        ".yyyyyyyr.",
        ".yhhyyyyr.",
        "yyhyyyyyyr",
        "yyyyyyyyyr",
        "yyyyyyyyyr",
        "yyyyyyyyyr",
        ".yyyyyyyr.",
        ".rryyyyrr.",
        "...rrrr...",
    ],
    colors: { y: "#fde047", r: "#facc15", h: "#fef9c3" },
};

const CLOUD_COLORS = { w: "#ffffff", s: "#dbeafe" };

const CLOUD: PixelSpriteArt = {
    rows: [
        "......wwww..........",
        "....wwwwwwww..www...",
        "..wwwwwwwwwwwwwwwww.",
        "wwwwwwwwwwwwwwwwwwww",
        ".ssssssssssssssssss.",
    ],
    colors: CLOUD_COLORS,
};

const SMALL_CLOUD: PixelSpriteArt = {
    rows: ["...www.....", ".wwwwwww...", "wwwwwwwwwww", ".sssssssss."],
    colors: CLOUD_COLORS,
};

const BIRDS: PixelSpriteArt = {
    rows: ["oo.oo.........", "..o.....oo.oo.", "..........o..."],
    colors: { o: "#1e3a8a" },
};

const COCONUT_DRINK: PixelSpriteArt = {
    rows: [".....r.", "....r..", ".cccrc.", "bbbbbbb", "bbbbbbB", "bbbbbbB", ".bbbbB.", "..BBB.."],
    colors: { r: "#dc2626", c: "#fffbeb", b: "#7c4a2d", B: "#5b341f" },
};

const SANDCASTLE: PixelSpriteArt = {
    rows: [
        "..ff........",
        "..fff.......",
        "..p.........",
        ".s.s....s.s.",
        ".sss....sss.",
        ".sSs....sSs.",
        ".sss.s.ssss.",
        "ssssssssssss",
        "sssssSSsssss",
        "sssssSSsssss",
    ],
    colors: { f: "#dc2626", p: "#71717a", s: "#e9c46a", S: "#b8892f" },
};

const STARFISH: PixelSpriteArt = {
    rows: ["...o...", "...o...", "ooooooo", ".ooooo.", "..ooo..", ".oo.oo.", "oo...oo"],
    colors: { o: "#f97316" },
};

const SHORE_FOAM: PixelSpriteArt = {
    rows: ["..ww........ww......", "wwwwww....wwwwwwww..", "wwwwwwwwwwwwwwwwwwww"],
    colors: { w: "#ffffff" },
};

const WAVE_MARKS: PixelSpriteArt = {
    rows: [
        "................................",
        "...ll...........................",
        "..........................ll....",
        "..................lll...........",
        "................................",
        "......lll.......................",
        "............................ll..",
        "...............ll...............",
        "................................",
        "................................",
    ],
    colors: { l: "#60a5fa" },
};

const SEA_SPARKLES: PixelSpriteArt = {
    rows: [
        "................................................",
        ".....w..........................................",
        "..............................w.................",
        "................................................",
        ".................w..............................",
        "............................................w...",
        "................................................",
        "..........w.....................................",
        "................................................",
        "................................................",
    ],
    colors: { w: "#ffffff" },
};

const SAND_SPECKLES: PixelSpriteArt = {
    rows: [
        "......................",
        "...d..................",
        "..............d.......",
        "......................",
        "........d.............",
        "...................d..",
        "......................",
        ".d....................",
        "............d.........",
        "......................",
    ],
    colors: { d: "#ecc964" },
};

export default function BeachBreakSection() {
    return (
        <section
            aria-hidden
            className="relative h-90 w-full overflow-hidden border-b border-edge bg-[#e8f0fb] @container"
        >
            <PixelSprite
                art={CLOUD}
                scale={SPRITE_SCALE}
                className="beach-cloud-drift absolute top-10 left-0"
                style={{ animationDelay: "-30s" }}
            />
            <PixelSprite
                art={SMALL_CLOUD}
                scale={SPRITE_SCALE}
                className="beach-cloud-drift absolute top-21 left-0"
                style={{ animationDelay: "-75s" }}
            />
            <PixelSprite
                art={BIRDS}
                scale={SPRITE_SCALE}
                className="absolute top-27.5 left-[30%]"
            />
            <PixelSprite art={SUN} scale={SPRITE_SCALE} className="absolute top-12 right-[14%]" />

            <div className="absolute inset-x-0 bottom-35 h-18 bg-[#3b82f6]">
                <div className="h-1.5 bg-[#2563eb]" />
                <PixelStrip
                    art={WAVE_MARKS}
                    scale={SPRITE_SCALE}
                    className="absolute top-1.5 left-0 h-16.5 w-full"
                />
                <PixelStrip
                    art={SEA_SPARKLES}
                    scale={SPRITE_SCALE}
                    className="beach-sparkle absolute top-1.5 left-0 h-16.5 w-full"
                />
            </div>

            <div className="absolute inset-x-0 bottom-0 h-35 bg-[#fde68a]">
                <div className="h-6 bg-[#f5d27a]" />
                <PixelStrip
                    art={SAND_SPECKLES}
                    scale={SPRITE_SCALE}
                    className="absolute top-6 left-0 h-29 w-full"
                />
            </div>
            <PixelStrip
                art={SHORE_FOAM}
                scale={SPRITE_SCALE}
                className="absolute bottom-32 left-0 h-4.5 w-full"
            />

            <PixelSprite
                art={UMBRELLA_SHADOW}
                scale={SPRITE_SCALE}
                className="absolute bottom-6 left-[calc(50%-108px)]"
            />
            <PixelSprite
                art={SANDCASTLE}
                scale={SPRITE_SCALE}
                className="absolute bottom-10 left-[calc(50%-300px)] hidden sm:block"
            />
            <PixelSprite
                art={STARFISH}
                scale={SPRITE_SCALE}
                className="absolute bottom-5 left-[calc(50%+250px)] hidden sm:block"
            />
            <PixelSprite
                art={UMBRELLA}
                scale={SPRITE_SCALE}
                className="absolute bottom-15 left-[calc(50%-84px)]"
            />
            <div className="absolute bottom-9 left-1/2 -translate-x-1/2">
                <PixelSprite art={GUY_WITH_LAPTOP} scale={SPRITE_SCALE} className="block" />
                <PixelSprite
                    art={LEG_RAISED}
                    scale={SPRITE_SCALE}
                    className="beach-leg-raised absolute top-3 left-7.5"
                />
                <PixelSprite
                    art={LEG_SWUNG}
                    scale={SPRITE_SCALE}
                    className="beach-leg-swung absolute top-3 left-7.5"
                />
            </div>
            <PixelSprite
                art={COCONUT_DRINK}
                scale={SPRITE_SCALE}
                className="absolute bottom-10 left-[calc(50%+144px)]"
            />
        </section>
    );
}
