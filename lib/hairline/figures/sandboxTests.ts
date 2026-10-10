import { Cam, facing, fit, open, proj, seg, type Vec2 } from "../core/iso";
import { reducedMotion } from "../core/motion";
import { disposer, type FigureEls, type FigureHandle, mk, register, solid } from "../core/stage";
import { plinth, prepareStage, progress, type Scene, setOpacity, slab, smooth, tag } from "./kit";

const WIDTH = 400;
const HEIGHT = 300;
const CYCLE_MS = 7400;
const STILL_FRAME_MS = 4600;
const GROUND = 5;
const PLINTH_X = 118;
const PLINTH_Y = 96;
const BASE_TOP = GROUND + 5;
const BASE_HALF_X = 74;
const BASE_HALF_Y = 60;
const CAGE_HALF_X = 82;
const CAGE_HALF_Y = 68;
const CAGE_HEIGHT = 62;
const CUBE_HALF = 10;
const CUBE_HEIGHT = 15;

const COLUMNS_X = [-45, -15, 15, 45];
const ROWS_Y = [-30, 0, 30];
const TEST_COUNT = COLUMNS_X.length * ROWS_Y.length;

const CAGE_IN_MS = 600;
const RISE_FROM_MS = 600;
const RISE_STAGGER_MS = 60;
const RISE_MS = 420;
const PASS_FROM_MS = 1900;
const PASS_STEP_MS = 190;
const PASSED_MS = PASS_FROM_MS + TEST_COUNT * PASS_STEP_MS;
const TEARDOWN_FROM_MS = 5200;
const TEARDOWN_MS = 800;

const TESTS: Vec2[] = ROWS_Y.flatMap((y) => COLUMNS_X.map((x): Vec2 => [x, y])).sort(
    (a, b) => a[0] + a[1] - (b[0] + b[1]),
);

export function mountSandboxTests(els: FigureEls): FigureHandle {
    const bag = disposer();
    const root = prepareStage(els, bag, WIDTH, HEIGHT);
    const camera = Cam(45, 0.5, 1.08);
    const cageTop = BASE_TOP + CAGE_HEIGHT;
    fit(
        camera,
        [
            [-PLINTH_X, -PLINTH_Y, 0],
            [PLINTH_X, PLINTH_Y, 0],
            [-PLINTH_X, PLINTH_Y, 0],
            [PLINTH_X, -PLINTH_Y, 0],
            [-CAGE_HALF_X, -CAGE_HALF_Y, cageTop + 30],
        ],
        WIDTH / 2,
        HEIGHT / 2,
    );
    const scene: Scene = { P: proj(camera), front: facing(camera) };
    const { P } = scene;

    plinth(root, scene, PLINTH_X, PLINTH_Y, GROUND, 23.6);
    const base = solid(root);
    slab(base, scene, [0, 0], BASE_HALF_X, BASE_HALF_Y, GROUND, BASE_TOP - GROUND, 6);

    const corners: Vec2[] = [
        [-CAGE_HALF_X, -CAGE_HALF_Y],
        [CAGE_HALF_X, -CAGE_HALF_Y],
        [CAGE_HALF_X, CAGE_HALF_Y],
        [-CAGE_HALF_X, CAGE_HALF_Y],
    ];
    const cageBack = mk(
        "path",
        {
            d:
                seg(
                    P(-CAGE_HALF_X, -CAGE_HALF_Y, BASE_TOP),
                    P(-CAGE_HALF_X, -CAGE_HALF_Y, cageTop),
                ) + open([corners[3], corners[0], corners[1]].map((c) => P(c[0], c[1], cageTop))),
            class: "nf mid",
            "stroke-dasharray": "2 3",
        },
        root,
    );

    const cubes = TESTS.map(() => solid(root));

    const cageFront = mk(
        "path",
        {
            d:
                [corners[1], corners[2], corners[3]]
                    .map((c) => seg(P(c[0], c[1], BASE_TOP), P(c[0], c[1], cageTop)))
                    .join("") +
                open([corners[1], corners[2], corners[3]].map((c) => P(c[0], c[1], cageTop))),
            class: "nf mid",
            "stroke-dasharray": "2 3",
        },
        root,
    );

    const labels = mk("g", {}, root);
    const status = tag(labels, scene, [0, -CAGE_HALF_Y, cageTop], "", 18);
    status.label.classList.add("on");

    function render(elapsed: number) {
        const t = elapsed % CYCLE_MS;
        const teardown = smooth(progress(t, TEARDOWN_FROM_MS, TEARDOWN_FROM_MS + TEARDOWN_MS));
        const cageIn = smooth(progress(t, 0, CAGE_IN_MS));
        const present = cageIn * (1 - teardown);
        setOpacity(cageBack, present);
        setOpacity(cageFront, present);
        const allPassed = t >= PASSED_MS && t < TEARDOWN_FROM_MS;
        cageBack.classList.toggle("accent", allPassed);
        cageFront.classList.toggle("accent", allPassed);

        let passed = 0;
        TESTS.forEach((centre, index) => {
            const riseStart = RISE_FROM_MS + index * RISE_STAGGER_MS;
            const rise = smooth(progress(t, riseStart, riseStart + RISE_MS));
            const passAt = PASS_FROM_MS + index * PASS_STEP_MS;
            const isPassed = t >= passAt;
            if (isPassed) passed++;
            const cube = cubes[index];
            setOpacity(cube.g, rise > 0 ? 1 - teardown : 0);
            cube.sil.classList.toggle("filled", isPassed);
            slab(
                cube,
                scene,
                centre,
                CUBE_HALF,
                CUBE_HALF,
                BASE_TOP,
                Math.max(0.6, CUBE_HEIGHT * rise),
                2,
            );
        });

        let text = "spinning up runner";
        if (t >= PASS_FROM_MS) text = `tests ${passed}/${TEST_COUNT}`;
        if (t >= PASSED_MS) text = `${TEST_COUNT}/${TEST_COUNT} passing`;
        if (t >= TEARDOWN_FROM_MS) text = "runner destroyed";
        status.label.textContent = text;
        const statusFade = 1 - progress(t, TEARDOWN_FROM_MS + TEARDOWN_MS + 600, CYCLE_MS - 200);
        setOpacity(status.label, Math.min(cageIn, statusFade));
        setOpacity(status.leader, present);
    }

    const startedAt = performance.now();
    const loop = register(els.stage, (_dt, now) => {
        if (reducedMotion()) {
            render(STILL_FRAME_MS);
            return false;
        }
        render(now - startedAt);
        return true;
    });
    bag.add(loop.unregister);

    return { set() {}, destroy: bag.dispose };
}
