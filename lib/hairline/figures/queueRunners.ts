import {
    Cam,
    facing,
    fit,
    lerp,
    open,
    poly,
    proj,
    r2,
    seg,
    type Vec2,
    type Vec3,
} from "../core/iso";
import { disposer, type FigureEls, type FigureHandle, mk, place, solid } from "../core/stage";
import {
    cylinder,
    loopShare,
    plinth,
    pointAlong3,
    prepareStage,
    progress,
    type Scene,
    scrubbedFigure,
    setOpacity,
    slab,
    smooth,
} from "./kit";

const WIDTH = 400;
const HEIGHT = 320;
const GROUND = 5;
const PLINTH_HALF = 118;
const GRID_STEP = 23.6;
const MARBLE_RADIUS = 4;

const HOPPER_CENTRE = -80;
const HOPPER_HALF = 15;
const HOPPER_TOP = GROUND + 40;

const CHUTE_X = HOPPER_CENTRE;
const CHUTE_HALF_WIDTH = 5;
const CHUTE_START: Vec3 = [CHUTE_X, HOPPER_CENTRE + HOPPER_HALF, 38];
const CHUTE_END: Vec3 = [CHUTE_X, 24, 15];
const CHUTE_SUPPORTS_Y = [-34, -4];

const RAIL_Y = CHUTE_END[1];
const RAIL_Z = CHUTE_END[2];
const RAIL_HALF_WIDTH = 3;

const RUNNERS_X = [-42, 2, 46];
const RUNNER_Y = 58;
const RUNNER_HALF = 14;
const RUNNER_HEIGHT = 28;
const CAGE_HALF = RUNNER_HALF + 5;
const CAGE_TOP = GROUND + RUNNER_HEIGHT + 9;
const PIN_OFFSETS: Vec2[] = [
    [-5, -5],
    [5, -5],
    [-5, 5],
    [5, 5],
];

const BELT_Y = 90;
const BELT_TOP = GROUND + 3;
const TRAY_X = 92;
const TRAY_HALF = 13;
const TRAY_TOP = GROUND + 4;
const PLATE_HALF = 8;
const PLATE_THICKNESS = 1.8;
const PLATE_PITCH = 2.6;
const MAX_PLATES = 6;

const DATABASE_CENTRE: Vec2 = [10, -80];
const DATABASE_RADIUS = 13;
const DATABASE_HEIGHT = 22;
const DATABASE_RINGS = 3;

const METRICS_CENTRE: Vec2 = [78, -62];
const METRIC_BARS = 6;
const METRIC_SPACING = 5;

const WIRE_Z = GROUND + 0.4;
const DATABASE_WIRE: Vec3[] = [
    [DATABASE_CENTRE[0], RAIL_Y - 6, WIRE_Z],
    [DATABASE_CENTRE[0], DATABASE_CENTRE[1] + DATABASE_RADIUS, WIRE_Z],
];
const METRICS_WIRE: Vec3[] = [
    [RUNNERS_X[2] + 14, RAIL_Y, WIRE_Z],
    [METRICS_CENTRE[0], RAIL_Y, WIRE_Z],
    [METRICS_CENTRE[0], METRICS_CENTRE[1] + 8, WIRE_Z],
];
const PACKETS_PER_WIRE = 3;

const MARBLES = 6;
const QUEUE_SPACING = 0.13;
const FALL_FROM = 0.16;
const FALL_STAGGER = 0.025;
const FALL_SPAN = 0.07;
const RUN_FROM = 0.34;
const CYCLE_SECONDS = 6;
const LEAVE_SHARE = 0.3;
const DWELL_SHARE = 0.58;
const EXIT_SHARE = 0.9;

const onChute = (share: number): Vec3 =>
    [0, 1, 2].map((axis) => lerp(CHUTE_START[axis], CHUTE_END[axis], share)) as Vec3;

const runnerOf = (marble: number) => marble % RUNNERS_X.length;

export function mountQueueRunners(els: FigureEls, value: number): FigureHandle {
    const bag = disposer();
    const root = prepareStage(els, bag, WIDTH, HEIGHT);
    const camera = Cam(45, 0.5, 1.15);
    fit(
        camera,
        [
            [-PLINTH_HALF, -PLINTH_HALF, 0],
            [PLINTH_HALF, PLINTH_HALF, 0],
            [-PLINTH_HALF, PLINTH_HALF, 0],
            [PLINTH_HALF, -PLINTH_HALF, 0],
            [HOPPER_CENTRE, HOPPER_CENTRE, HOPPER_TOP + 20],
        ],
        WIDTH / 2,
        HEIGHT / 2,
    );
    const scene: Scene = { P: proj(camera), front: facing(camera) };
    const { P } = scene;
    const at = (point: Vec3) => P(point[0], point[1], point[2]);
    const marbleRadius = r2(MARBLE_RADIUS * camera.S);
    const pinRadius = r2(1.3 * camera.S);
    const packetRadius = r2(1.4 * camera.S);
    const lift = (point: Vec3, by: number) => P(point[0], point[1], point[2] + by);

    plinth(root, scene, PLINTH_HALF, PLINTH_HALF, GROUND, GRID_STEP);

    const databaseWire = mk(
        "path",
        { class: "nf mid", "stroke-dasharray": "2 3", d: open(DATABASE_WIRE.map(at)) },
        root,
    );
    const metricsWire = mk(
        "path",
        { class: "nf mid", "stroke-dasharray": "2 3", d: open(METRICS_WIRE.map(at)) },
        root,
    );

    const databaseGroup = mk("g", {}, root);
    const databaseRings = Array.from({ length: DATABASE_RINGS }, () => solid(databaseGroup));

    const metricsGroup = mk("g", {}, root);
    slab(solid(metricsGroup), scene, METRICS_CENTRE, 18, 7, GROUND, 3, 2);
    const metricBars = Array.from({ length: METRIC_BARS }, () => solid(metricsGroup));

    const hopperGroup = mk("g", {}, root);
    slab(
        solid(hopperGroup),
        scene,
        [HOPPER_CENTRE, HOPPER_CENTRE],
        HOPPER_HALF,
        HOPPER_HALF,
        GROUND,
        HOPPER_TOP - GROUND,
        3,
    );
    slab(
        solid(hopperGroup),
        scene,
        [HOPPER_CENTRE, HOPPER_CENTRE],
        HOPPER_HALF - 4,
        HOPPER_HALF - 4,
        HOPPER_TOP,
        0.6,
        2,
    );

    const chuteGroup = mk("g", {}, root);
    mk(
        "path",
        {
            class: "nf lo",
            d: CHUTE_SUPPORTS_Y.map((y) => {
                const top = onChute((y - CHUTE_START[1]) / (CHUTE_END[1] - CHUTE_START[1]));
                return seg(P(CHUTE_X, y, top[2]), P(CHUTE_X, y, GROUND));
            }).join(""),
        },
        chuteGroup,
    );
    mk(
        "path",
        {
            d: poly([
                P(CHUTE_X - CHUTE_HALF_WIDTH, CHUTE_START[1], CHUTE_START[2]),
                P(CHUTE_X + CHUTE_HALF_WIDTH, CHUTE_START[1], CHUTE_START[2]),
                P(CHUTE_X + CHUTE_HALF_WIDTH, CHUTE_END[1], CHUTE_END[2]),
                P(CHUTE_X - CHUTE_HALF_WIDTH, CHUTE_END[1], CHUTE_END[2]),
            ]),
        },
        chuteGroup,
    );

    const railGroup = mk("g", {}, root);
    const lastRunner = RUNNERS_X[RUNNERS_X.length - 1];
    mk(
        "path",
        {
            d: poly([
                P(CHUTE_X - CHUTE_HALF_WIDTH, RAIL_Y - RAIL_HALF_WIDTH, RAIL_Z),
                P(lastRunner + RAIL_HALF_WIDTH, RAIL_Y - RAIL_HALF_WIDTH, RAIL_Z),
                P(lastRunner + RAIL_HALF_WIDTH, RAIL_Y + RAIL_HALF_WIDTH, RAIL_Z),
                P(CHUTE_X - CHUTE_HALF_WIDTH, RAIL_Y + RAIL_HALF_WIDTH, RAIL_Z),
            ]),
        },
        railGroup,
    );
    RUNNERS_X.forEach((x) =>
        mk(
            "path",
            {
                d: poly([
                    P(x - RAIL_HALF_WIDTH, RAIL_Y + RAIL_HALF_WIDTH, RAIL_Z),
                    P(x + RAIL_HALF_WIDTH, RAIL_Y + RAIL_HALF_WIDTH, RAIL_Z),
                    P(x + RAIL_HALF_WIDTH, RUNNER_Y - RUNNER_HALF, RAIL_Z),
                    P(x - RAIL_HALF_WIDTH, RUNNER_Y - RUNNER_HALF, RAIL_Z),
                ]),
            },
            railGroup,
        ),
    );

    const backMarbles = Array.from({ length: MARBLES }, () =>
        mk("ellipse", { rx: marbleRadius, ry: marbleRadius, class: "filled" }, root),
    );

    const cageCorners = (x: number): Vec2[] => [
        [x - CAGE_HALF, RUNNER_Y - CAGE_HALF],
        [x + CAGE_HALF, RUNNER_Y - CAGE_HALF],
        [x + CAGE_HALF, RUNNER_Y + CAGE_HALF],
        [x - CAGE_HALF, RUNNER_Y + CAGE_HALF],
    ];
    const cageBacks = RUNNERS_X.map((x) => {
        const corners = cageCorners(x);
        return mk(
            "path",
            {
                class: "nf mid",
                "stroke-dasharray": "2 3",
                d:
                    seg(P(...corners[0], GROUND), P(...corners[0], CAGE_TOP)) +
                    open([corners[3], corners[0], corners[1]].map((c) => P(c[0], c[1], CAGE_TOP))),
            },
            root,
        );
    });

    const runners = RUNNERS_X.map((x) => {
        const group = mk("g", {}, root);
        return {
            x,
            group,
            body: solid(group),
            pins: PIN_OFFSETS.map(() =>
                mk(
                    "ellipse",
                    { rx: pinRadius, ry: r2(pinRadius * camera.k), class: "dot off" },
                    group,
                ),
            ),
        };
    });

    const cageFronts = RUNNERS_X.map((x) => {
        const corners = cageCorners(x);
        return mk(
            "path",
            {
                class: "nf mid",
                "stroke-dasharray": "2 3",
                d:
                    [corners[1], corners[2], corners[3]]
                        .map((c) => seg(P(c[0], c[1], GROUND), P(c[0], c[1], CAGE_TOP)))
                        .join("") +
                    open([corners[1], corners[2], corners[3]].map((c) => P(c[0], c[1], CAGE_TOP))),
            },
            root,
        );
    });

    const outputGroup = mk("g", {}, root);
    slab(
        solid(outputGroup),
        scene,
        [(RUNNERS_X[0] + TRAY_X) / 2 - 6, BELT_Y],
        (TRAY_X - RUNNERS_X[0]) / 2 - 2,
        5,
        GROUND,
        BELT_TOP - GROUND,
        1.6,
    );
    slab(
        solid(outputGroup),
        scene,
        [TRAY_X, BELT_Y],
        TRAY_HALF,
        TRAY_HALF,
        GROUND,
        TRAY_TOP - GROUND,
        3,
    );
    const plates = Array.from({ length: MAX_PLATES }, (_, index) => {
        const plate = solid(outputGroup);
        plate.sil.classList.add("filled");
        slab(
            plate,
            scene,
            [TRAY_X, BELT_Y],
            PLATE_HALF,
            PLATE_HALF,
            TRAY_TOP + index * PLATE_PITCH,
            PLATE_THICKNESS,
            1.2,
        );
        return plate;
    });

    const frontMarbles = Array.from({ length: MARBLES }, () =>
        mk("ellipse", { rx: marbleRadius, ry: marbleRadius, class: "filled" }, root),
    );

    const packets = (count: number) =>
        Array.from({ length: count }, () =>
            mk("ellipse", { rx: packetRadius, ry: packetRadius, class: "dot accent" }, root),
        );
    const databasePackets = packets(PACKETS_PER_WIRE);
    const metricsPackets = packets(PACKETS_PER_WIRE);

    let flowSeconds = 0;
    let lastSeconds = 0;

    function render(sceneProgress: number, seconds: number) {
        const dt = Math.max(0, seconds - lastSeconds);
        lastSeconds = seconds;
        flowSeconds = sceneProgress >= RUN_FROM ? flowSeconds + dt : 0;

        setOpacity(hopperGroup, progress(sceneProgress, 0, 0.05));
        setOpacity(chuteGroup, progress(sceneProgress, 0.03, 0.08));
        setOpacity(railGroup, progress(sceneProgress, 0.05, 0.1));
        setOpacity(outputGroup, progress(sceneProgress, 0.12, 0.17));

        const databaseIn = smooth(progress(sceneProgress, 0.42, 0.52));
        setOpacity(databaseGroup, databaseIn);
        setOpacity(databaseWire, databaseIn);
        databaseRings.forEach((ring, index) => {
            const share = DATABASE_HEIGHT / DATABASE_RINGS;
            const z = GROUND + index * share * databaseIn;
            cylinder(
                ring,
                scene,
                DATABASE_CENTRE,
                DATABASE_RADIUS,
                z,
                Math.max(0.6, (share - 1.5) * databaseIn),
            );
        });
        databaseWire.setAttribute("stroke-dashoffset", String(r2(seconds * 6)));

        const observed = smooth(progress(sceneProgress, 0.7, 0.8));
        setOpacity(metricsGroup, observed);
        setOpacity(metricsWire, observed);
        metricsWire.setAttribute("stroke-dashoffset", String(r2(-seconds * 6)));
        const heights = metricBars.map((_, index) => {
            const wave = 0.5 + 0.5 * Math.sin(seconds * 1.4 + index * 1.15);
            return Math.max(0.6, (4 + 18 * wave) * observed);
        });
        const peak = heights.indexOf(Math.max(...heights));
        metricBars.forEach((bar, index) => {
            const x =
                METRICS_CENTRE[0] -
                ((METRIC_BARS - 1) * METRIC_SPACING) / 2 +
                index * METRIC_SPACING;
            slab(bar, scene, [x, METRICS_CENTRE[1]], 1.8, 1.8, GROUND + 3, heights[index], 0.6);
            bar.sil.classList.toggle("accent", index === peak);
        });

        const sandboxed = progress(sceneProgress, 0.67, 0.75);
        cageBacks.forEach((cage) => setOpacity(cage, sandboxed));
        cageFronts.forEach((cage) => setOpacity(cage, sandboxed));

        const busy = new Set<number>();
        const testsPassed = RUNNERS_X.map(() => 0);
        let started = 0;
        let completed = 0;

        for (let marble = 0; marble < MARBLES; marble++) {
            const runnerX = RUNNERS_X[runnerOf(marble)];
            const fallStart = FALL_FROM + marble * FALL_STAGGER;
            const fall = smooth(progress(sceneProgress, fallStart, fallStart + FALL_SPAN));
            const laps = flowSeconds / CYCLE_SECONDS - marble / MARBLES;
            const back = backMarbles[marble];
            const front = frontMarbles[marble];
            setOpacity(back, 0);
            setOpacity(front, 0);

            if (laps < 0) {
                const queueShare = 1 - (marble - started + 1) * QUEUE_SPACING;
                place(back, lift(onChute(queueShare * fall), MARBLE_RADIUS));
                setOpacity(back, Math.min(1, fall * 5));
                continue;
            }
            started++;
            completed += Math.max(0, Math.floor(laps - EXIT_SHARE) + 1);
            const lap = laps % 1;
            const firstLap = laps < 1;

            if (lap < LEAVE_SHARE) {
                const leave = smooth(progress(lap, 0, LEAVE_SHARE));
                const from = firstLap ? onChute(1 - QUEUE_SPACING) : CHUTE_START;
                const point = pointAlong3(
                    [from, CHUTE_END, [runnerX, RAIL_Y, RAIL_Z], [runnerX, RUNNER_Y, RAIL_Z]],
                    leave,
                );
                place(back, lift(point, MARBLE_RADIUS));
                setOpacity(back, firstLap ? 1 : Math.min(1, leave * 12));
            } else if (lap < DWELL_SHARE) {
                busy.add(runnerOf(marble));
                testsPassed[runnerOf(marble)] = Math.floor(
                    progress(lap, LEAVE_SHARE, DWELL_SHARE) * (PIN_OFFSETS.length + 1),
                );
            } else if (lap < EXIT_SHARE) {
                const exit = smooth(progress(lap, DWELL_SHARE, EXIT_SHARE));
                const point = pointAlong3(
                    [
                        [runnerX, RUNNER_Y + RUNNER_HALF, BELT_TOP],
                        [runnerX, BELT_Y, BELT_TOP],
                        [TRAY_X, BELT_Y, BELT_TOP],
                    ],
                    exit,
                );
                place(front, lift(point, MARBLE_RADIUS));
                setOpacity(front, Math.min(progress(exit, 0, 0.08), 1 - progress(exit, 0.9, 1)));
            }
        }

        runners.forEach((runner, index) => {
            const rise = smooth(progress(sceneProgress, 0.08 + index * 0.02, 0.16 + index * 0.02));
            setOpacity(runner.group, rise > 0 ? 1 : 0);
            const height = Math.max(0.6, RUNNER_HEIGHT * rise);
            slab(
                runner.body,
                scene,
                [runner.x, RUNNER_Y],
                RUNNER_HALF,
                RUNNER_HALF,
                GROUND,
                height,
                3,
            );
            runner.body.sil.classList.toggle("accent", busy.has(index));
            runner.pins.forEach((pin, pinIndex) => {
                const [dx, dy] = PIN_OFFSETS[pinIndex];
                place(pin, P(runner.x + dx, RUNNER_Y + dy, GROUND + height));
                setOpacity(pin, rise);
                const passed = busy.has(index) && pinIndex < testsPassed[index];
                pin.classList.toggle("accent", passed);
                pin.classList.toggle("off", !passed);
            });
        });

        const shown = completed === 0 ? 0 : ((completed - 1) % MAX_PLATES) + 1;
        plates.forEach((plate, index) => setOpacity(plate.g, index < shown ? 1 : 0));

        const flow = (dots: SVGEllipseElement[], route: Vec3[], visible: number, period: number) =>
            dots.forEach((packet, index) => {
                const share = loopShare(seconds, period, index / dots.length);
                place(packet, P(...pointAlong3(route, share)));
                setOpacity(packet, visible >= 1 ? Math.min(1, share * 8, (1 - share) * 8) : 0);
            });
        flow(databasePackets, DATABASE_WIRE, databaseIn, 2.4);
        flow(metricsPackets, METRICS_WIRE, observed, 2.8);
    }

    return scrubbedFigure(els.stage, bag, value, render);
}
