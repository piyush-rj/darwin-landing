import {
    Cam,
    clamp,
    facing,
    fit,
    lerp,
    open,
    prism,
    proj,
    r2,
    seg,
    type Vec2,
    type Vec3,
} from "../core/iso";
import { reducedMotion } from "../core/motion";
import {
    disposer,
    type FigureEls,
    type FigureHandle,
    mk,
    put,
    register,
    type Solid,
    solid,
} from "../core/stage";
import { pointAlong, progress, smooth, square } from "./kit";

const VIEWBOX = 400;
const REST_MS = 700;
const SOURCE_LIT_MS = 300;
const ARRIVE_MS = 2400;
const TESTED_MS = 5300;
const SHIPPED_MS = 7200;
const LANDED_MS = 8800;
const STILL_FRAME_MS = 6200;
const TEST_COUNT = 24;

const PLINTH_HALF = 118;
const GROUND = 5;
const GRID_STEP = 23.6;

const TOWER_HALF = 25;
const CROWN_HALF = 29;
const FLOORS = 11;
const FLOOR_THICKNESS = 6;
const FLOOR_PITCH = 8.6;
const TOWER_TOP = GROUND + FLOORS * FLOOR_PITCH;

const PAD_HALF = 16;
const PAD_TOP = GROUND + 9;
const PACKET_HALF = 5;
const PACKET_THICKNESS = 2.4;
const PR_HALF = 9;
const PR_THICKNESS = 3.4;
const RISE_SHARE = 0.16;
const TRAIL = 0.35;

const STATUS_LIFT = 30;
const STATUS_HEIGHT = 16;
const STATUS_PADDING = 8;

type Integration = { name: string; pad: Vec2; route: Vec2[]; behindTower: boolean };

export const INTEGRATIONS: Integration[] = [
    {
        name: "GitHub",
        pad: [20, 108],
        route: [
            [20, 108],
            [20, TOWER_HALF],
        ],
        behindTower: false,
    },
    {
        name: "Telegram",
        pad: [108, 20],
        route: [
            [108, 20],
            [TOWER_HALF, 20],
        ],
        behindTower: false,
    },
    {
        name: "Slack",
        pad: [78, -78],
        route: [
            [78, -78],
            [78, -8],
            [TOWER_HALF, -8],
        ],
        behindTower: false,
    },
    {
        name: "Figma",
        pad: [-78, 78],
        route: [
            [-78, 78],
            [-78, 8],
            [-TOWER_HALF, 8],
        ],
        behindTower: true,
    },
];

const PAINT_ORDER = [3, 2, 0, 1];

type Leg = { integration: number; direction: "in" | "out"; size: "packet" | "plate" };
type Beat = {
    duration: number;
    leg?: Leg;
    fill: (progress: number) => number;
    label: (progress: number, run: number) => string;
    lit?: number;
};

const REVIEW_FILL = 0.7;
const EMPTY = () => 0;
const FULL = () => 1;
const RISING = (progress: number) => progress;
const issueKey = (run: number) => `NOC-${142 + run}`;
const pullRequestKey = (run: number) => `PR #${918 + run}`;
const SHIP_TO_GITHUB: Leg = { integration: 0, direction: "out", size: "plate" };
const READY_FOR_REVIEW: Beat = {
    duration: LANDED_MS - SHIPPED_MS,
    fill: FULL,
    label: (_, run) => `${pullRequestKey(run)} · ready for review`,
    lit: 0,
};

const testsRunning = (passShare: number, duration: number): Beat => ({
    duration,
    fill: (progress) => progress * passShare,
    label: (progress) => {
        const passed = Math.round(progress * passShare * TEST_COUNT);
        return passed < TEST_COUNT
            ? `tests ${passed}/${TEST_COUNT}`
            : `${TEST_COUNT}/${TEST_COUNT} passing`;
    },
});

const SHIP_PULL_REQUEST: Beat = {
    duration: SHIPPED_MS - TESTED_MS,
    leg: SHIP_TO_GITHUB,
    fill: FULL,
    label: (_, run) => `${pullRequestKey(run)} → GitHub`,
};

const issueArrives = (integration: number): Beat => ({
    duration: ARRIVE_MS,
    leg: { integration, direction: "in", size: "packet" },
    fill: EMPTY,
    label: (_, run) => `${issueKey(run)} · from ${INTEGRATIONS[integration].name}`,
});

const issueFrom = (integration: number): Beat[] => [
    issueArrives(integration),
    testsRunning(1, TESTED_MS - ARRIVE_MS),
    SHIP_PULL_REQUEST,
    READY_FOR_REVIEW,
];

const SCRIPTS: Beat[][] = [
    issueFrom(0),
    [
        issueArrives(2),
        testsRunning(REVIEW_FILL, 1600),
        {
            duration: 900,
            fill: () => REVIEW_FILL,
            label: (_, run) => `${issueKey(run)} · needs review`,
        },
        {
            duration: 1400,
            leg: { integration: 1, direction: "out", size: "packet" },
            fill: () => REVIEW_FILL,
            label: () => "question → Telegram",
        },
        {
            duration: 1100,
            fill: () => REVIEW_FILL,
            label: () => "waiting on reply",
        },
        {
            duration: 1400,
            leg: { integration: 1, direction: "in", size: "packet" },
            fill: () => REVIEW_FILL,
            label: () => "reply → Darwin",
        },
        {
            duration: 900,
            fill: (progress) => lerp(REVIEW_FILL, 1, progress),
            label: (_, run) => `${issueKey(run)} · unblocked`,
        },
        SHIP_PULL_REQUEST,
        READY_FOR_REVIEW,
    ],
    issueFrom(2),
    [
        {
            duration: ARRIVE_MS,
            leg: { integration: 3, direction: "in", size: "packet" },
            fill: EMPTY,
            label: () => "frame link · from Figma",
        },
        {
            duration: TESTED_MS - ARRIVE_MS,
            fill: RISING,
            label: (progress) =>
                `cloning frame · ${Math.round(progress * TEST_COUNT)}/${TEST_COUNT} layers`,
        },
        {
            duration: SHIPPED_MS - TESTED_MS,
            leg: SHIP_TO_GITHUB,
            fill: FULL,
            label: () => "UI cloned → GitHub",
        },
        READY_FOR_REVIEW,
    ],
];

const SCRIPT_EDGES = SCRIPTS.map((script) =>
    script.reduce<number[]>(
        (edges, beat) => [...edges, edges[edges.length - 1] + beat.duration],
        [0],
    ),
);

const SCRIPT_CYCLES_MS = SCRIPT_EDGES.map((edges) => edges[edges.length - 1] + REST_MS);

const routeFor = (leg: Leg) => {
    const route = INTEGRATIONS[leg.integration].route;
    return leg.direction === "in" ? route : route.slice().reverse();
};

export function mountIntegrationTower(
    { stage, svg }: FigureEls,
    initialSource: number,
): FigureHandle {
    const bag = disposer();
    svg.setAttribute("viewBox", `0 0 ${VIEWBOX} ${VIEWBOX}`);
    const restingAspect = stage.style.aspectRatio;
    stage.style.aspectRatio = "1 / 1";
    bag.add(() => {
        stage.style.aspectRatio = restingAspect;
    });

    const camera = Cam(45, 0.5, 1.05);
    const corner = (x: number, y: number, z: number): Vec3 => [x, y, z];
    fit(
        camera,
        [
            corner(-PLINTH_HALF, -PLINTH_HALF, 0),
            corner(PLINTH_HALF, PLINTH_HALF, 0),
            corner(-PLINTH_HALF, PLINTH_HALF, 0),
            corner(PLINTH_HALF, -PLINTH_HALF, 0),
            corner(CROWN_HALF, -CROWN_HALF, TOWER_TOP),
        ],
        200,
        214,
    );
    const P = proj(camera);
    const front = facing(camera);
    const root = mk("g", {}, svg);

    const plinthGroup = mk("g", {}, root);
    const [plinthRing, plinthInner] = square([0, 0], PLINTH_HALF, 10, 2.4);
    put(solid(plinthGroup), prism(P, front, plinthRing, plinthInner, 0, GROUND));
    let grid = "";
    for (let line = -PLINTH_HALF + GRID_STEP; line < PLINTH_HALF - 1; line += GRID_STEP) {
        grid += seg(P(line, -PLINTH_HALF + 6, GROUND), P(line, PLINTH_HALF - 6, GROUND));
        grid += seg(P(-PLINTH_HALF + 6, line, GROUND), P(PLINTH_HALF - 6, line, GROUND));
    }
    mk("path", { d: grid, class: "nf lo", "stroke-dasharray": "1 3" }, plinthGroup);

    const routeGroup = mk("g", {}, root);
    const routePaths = INTEGRATIONS.map((integration) =>
        mk(
            "path",
            {
                d: open(integration.route.map((point) => P(point[0], point[1], GROUND))),
                class: "nf mid",
                "stroke-dasharray": "2 3",
            },
            routeGroup,
        ),
    );

    const behindLayer = mk("g", {}, root);
    const pads: Solid[] = new Array(INTEGRATIONS.length);
    const towerGroup = mk("g", {}, root);
    const frontLayer = mk("g", {}, root);

    PAINT_ORDER.forEach((index) => {
        const integration = INTEGRATIONS[index];
        const parent = integration.behindTower ? behindLayer : frontLayer;
        const pad = solid(parent);
        const [ring, inner] = square(integration.pad, PAD_HALF, 4, 1.4);
        put(pad, prism(P, front, ring, inner, GROUND, PAD_TOP));
        pads[index] = pad;
    });

    const floors = Array.from({ length: FLOORS }, (_, floor) => {
        const half = floor === FLOORS - 1 ? CROWN_HALF : TOWER_HALF;
        const z = GROUND + floor * FLOOR_PITCH;
        const element = solid(towerGroup);
        const [ring, inner] = square([0, 0], half, 3, 1.2);
        put(element, prism(P, front, ring, inner, z, z + FLOOR_THICKNESS));
        return element;
    });
    const trails = {
        behind: mk("path", { class: "nf accent" }, behindLayer),
        front: mk("path", { class: "nf accent" }, frontLayer),
    };
    const movers = { behind: solid(behindLayer), front: solid(frontLayer) };
    movers.behind.sil.classList.add("filled");
    movers.front.sil.classList.add("filled");

    const labelGroup = mk("g", {}, root);
    const padLabels = INTEGRATIONS.map((integration) => {
        const top = P(integration.pad[0], integration.pad[1], PAD_TOP);
        const anchorY = top[1] - 22;
        mk(
            "path",
            { d: seg(top, [top[0], anchorY + 3]), class: "nf lo", "stroke-dasharray": "1 2" },
            labelGroup,
        );
        const label = mk(
            "text",
            { class: "hairline-label", "text-anchor": "middle", x: r2(top[0]), y: r2(anchorY) },
            labelGroup,
        );
        label.textContent = integration.name;
        return label;
    });
    const crownTop = P(0, 0, TOWER_TOP + FLOOR_THICKNESS);
    const statusCentreY = crownTop[1] - STATUS_LIFT;
    const statusLeader = mk(
        "path",
        {
            d: seg(crownTop, [crownTop[0], statusCentreY + STATUS_HEIGHT / 2]),
            class: "nf lo",
            "stroke-dasharray": "1 2",
        },
        labelGroup,
    );
    const statusTag = mk("g", {}, labelGroup);
    const statusPill = mk(
        "rect",
        {
            class: "hairline-pill",
            y: r2(statusCentreY - STATUS_HEIGHT / 2),
            height: STATUS_HEIGHT,
            rx: STATUS_HEIGHT / 2,
        },
        statusTag,
    );
    const status = mk(
        "text",
        {
            class: "hairline-label hairline-status on",
            "text-anchor": "middle",
            "dominant-baseline": "central",
            x: r2(crownTop[0]),
            y: r2(statusCentreY),
        },
        statusTag,
    );
    const fitStatusPill = () => {
        const width = status.getComputedTextLength() + STATUS_PADDING * 2;
        statusPill.setAttribute("x", String(r2(crownTop[0] - width / 2)));
        statusPill.setAttribute("width", String(r2(width)));
    };
    let shownStatus = "";

    let source = clamp(Math.round(initialSource), 0, INTEGRATIONS.length - 1);
    let cycleStartedAt = performance.now();
    let cycle = 0;

    const drawPlate = (
        element: Solid,
        centre: Vec2,
        half: number,
        z: number,
        thickness: number,
    ) => {
        const [ring, inner] = square(centre, half, 1.6, 0.6);
        put(element, prism(P, front, ring, inner, z, z + thickness));
    };

    const trailPath = (route: Vec2[], head: number, z: number) => {
        const from = Math.max(0, head - TRAIL);
        if (head <= 0) return "";
        return open(
            Array.from({ length: 25 }, (_, index) => {
                const point = pointAlong(route, lerp(from, head, index / 24));
                return P(point[0], point[1], z);
            }),
        );
    };

    function render(elapsed: number) {
        const t = elapsed % SCRIPT_CYCLES_MS[source];
        const script = SCRIPTS[source];
        const edges = SCRIPT_EDGES[source];
        const landed = edges[edges.length - 1];
        const done = t >= landed;
        let beatIndex = 0;
        while (beatIndex < script.length - 1 && t >= edges[beatIndex + 1]) beatIndex++;
        const beat = script[beatIndex];
        const beatStart = edges[beatIndex];
        const beatEnd = edges[beatIndex + 1];
        const beatProgress = progress(t, beatStart, beatEnd);
        const legProgress = progress(t, beatStart + (beatIndex === 0 ? SOURCE_LIT_MS : 0), beatEnd);
        const previousLeg = beatIndex > 0 ? script[beatIndex - 1].leg : undefined;
        const lit = new Set<number>();
        if (!done && beat.lit !== undefined) lit.add(beat.lit);

        (["behind", "front"] as const).forEach((layer) => {
            movers[layer].g.setAttribute("opacity", "0");
            trails[layer].setAttribute("d", "");
        });
        routePaths.forEach((path) => path.classList.remove("accent"));

        if (!done && beat.leg) {
            const leg = beat.leg;
            const integration = INTEGRATIONS[leg.integration];
            const layer = integration.behindTower ? "behind" : "front";
            const route = routeFor(leg);
            const eased = smooth(legProgress);
            const rising =
                leg.direction === "in"
                    ? 1 - smooth(progress(eased, 0, RISE_SHARE))
                    : smooth(progress(eased, 1 - RISE_SHARE, 1));
            const plate = leg.size === "plate";
            drawPlate(
                movers[layer],
                pointAlong(route, eased),
                plate ? PR_HALF : PACKET_HALF,
                lerp(GROUND + 0.4, PAD_TOP, rising),
                plate ? PR_THICKNESS : PACKET_THICKNESS,
            );
            const visible =
                legProgress <= 0
                    ? 0
                    : leg.direction === "in"
                      ? 1 - progress(eased, 0.9, 1)
                      : progress(eased, 0, 0.08);
            movers[layer].g.setAttribute("opacity", String(r2(visible)));
            if (legProgress > 0 && legProgress < 1) {
                trails[layer].setAttribute("d", trailPath(route, eased, GROUND + 0.4));
                routePaths[leg.integration].classList.add("accent");
            }
            if (leg.direction === "in" && legProgress < 0.35) lit.add(leg.integration);
            if (leg.direction === "out" && legProgress > 0.85) lit.add(leg.integration);
        } else if (!done && previousLeg?.direction === "out") {
            const integration = INTEGRATIONS[previousLeg.integration];
            const layer = integration.behindTower ? "behind" : "front";
            const plate = previousLeg.size === "plate";
            drawPlate(
                movers[layer],
                integration.pad,
                plate ? PR_HALF : PACKET_HALF,
                PAD_TOP,
                plate ? PR_THICKNESS : PACKET_THICKNESS,
            );
            movers[layer].g.setAttribute(
                "opacity",
                String(r2(1 - progress(t, beatEnd - 500, beatEnd))),
            );
            lit.add(previousLeg.integration);
        }

        const filled = done ? 0 : Math.round(beat.fill(beatProgress) * FLOORS);
        floors.forEach((floor, index) => floor.sil.classList.toggle("filled", index < filled));

        INTEGRATIONS.forEach((_, index) => {
            pads[index].sil.classList.toggle("accent", lit.has(index));
            padLabels[index].classList.toggle("on", index === source || lit.has(index));
        });

        const text = done ? "" : beat.label(beatProgress, cycle);
        if (text !== shownStatus) {
            shownStatus = text;
            status.textContent = text;
            fitStatusPill();
        }
        const fade = String(
            r2(Math.min(progress(t, 0, 300), 1 - progress(t, landed - 300, landed))),
        );
        statusTag.setAttribute("opacity", fade);
        statusLeader.setAttribute("opacity", fade);
    }

    const loop = register(stage, (_dt, now) => {
        if (reducedMotion()) {
            render(STILL_FRAME_MS);
            return false;
        }
        const elapsed = now - cycleStartedAt;
        cycle = Math.floor(elapsed / SCRIPT_CYCLES_MS[source]);
        render(elapsed);
        return true;
    });
    bag.add(loop.unregister);
    bag.add(() => svg.replaceChildren());

    return {
        set(value: number) {
            const next = clamp(Math.round(value), 0, INTEGRATIONS.length - 1);
            if (next === source) return;
            source = next;
            cycleStartedAt = performance.now();
            loop.wake();
        },
        destroy: bag.dispose,
    };
}

export const INTEGRATION_CYCLES_MS = SCRIPT_CYCLES_MS;
