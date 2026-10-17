import {
    Cam,
    clamp,
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
import { bezier } from "../core/motion";
import { disposer, type FigureEls, type FigureHandle, mk, place, solid } from "../core/stage";
import {
    cylinder,
    loopShare,
    plinth,
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
const PLINTH_X = 128;
const PLINTH_Y = 84;
const GRID_STEP = 21.3;

const BELT_FROM = -114;
const BELT_TO = 30;
const BELT_HALF_Y = 17;
const BELT_TOP = GROUND + 6;
const ROLLER_SPACING = 12;

const PRESS_X = -30;
const COLUMN_Y = -40;
const COLUMN_TOP = 86;
const ARM_FROM_Z = 78;
const HEAD_HALF = 19;
const HEAD_THICKNESS = 7;
const HEAD_REST = 58;

const TILE_HALF = 21;
const BUTTON_HALF = 15;
const SHAPED_HEIGHT = 12;
const ARRIVE_FROM_X = -104;

const PANEL_CENTRE: Vec2 = [62, -56];
const PANEL_HALF_X = 34;
const PANEL_TOP = GROUND + 50;
const PANEL_FACE_Y = PANEL_CENTRE[1] + 2.2;
const CURVE_FROM: Vec2 = [PANEL_CENTRE[0] - 26, GROUND + 12];
const CURVE_SIZE: Vec2 = [52, 30];
const EASE = bezier(0.22, 1, 0.36, 1);

const PAD_CENTRE: Vec2 = [80, 40];
const PAD_HALF = 32;
const PAD_TOP = GROUND + 6;
const BUTTON_CENTRE: Vec2 = [68, 30];
const TOGGLE_CENTRE: Vec2 = [98, 26];
const TOGGLE_TRAVEL = 6;
const SLIDER_CENTRE: Vec2 = [76, 64];
const SLIDER_HALF = 20;
const SLIDER_REST = 0.35;
const SLIDER_STOPS = [0.85, 0.2, 0.6];

const UI_FROM = 0.84;
const STEP_SECONDS = 1.5;

type Piece = { home: Vec2; drift: Vec2; half: number; height: number; tone: string };

const PIECES: Piece[] = [
    { home: [-10.5, -10.5], drift: [-6, 4], half: 7, height: 8, tone: "var(--color-violet-500)" },
    { home: [10.5, -10.5], drift: [5, -7], half: 12, height: 17, tone: "var(--color-sky-500)" },
    { home: [-10.5, 10.5], drift: [-3, 7], half: 9, height: 11, tone: "var(--color-sky-500)" },
    { home: [10.5, 10.5], drift: [8, 6], half: 11, height: 14, tone: "var(--color-violet-500)" },
];
const PIECE_HALF = 10;
const TALLEST_PIECE = Math.max(...PIECES.map((piece) => piece.height));

const CURSOR: Vec2[] = [
    [0, 0],
    [0, 14],
    [3.3, 10.6],
    [5.7, 15.8],
    [7.9, 14.8],
    [5.5, 9.6],
    [10, 9.6],
];

const bounce = (share: number) =>
    share <= 0 || share >= 1 ? 0 : Math.sin(share * Math.PI * 2.5) * Math.exp(-4 * share);

export function mountShapingPress(els: FigureEls, value: number): FigureHandle {
    const bag = disposer();
    const root = prepareStage(els, bag, WIDTH, HEIGHT);
    const camera = Cam(45, 0.5, 1.2);
    fit(
        camera,
        [
            [-PLINTH_X, -PLINTH_Y, 0],
            [PLINTH_X, PLINTH_Y, 0],
            [-PLINTH_X, PLINTH_Y, 0],
            [PLINTH_X, -PLINTH_Y, 0],
            [PRESS_X, COLUMN_Y, COLUMN_TOP],
        ],
        WIDTH / 2,
        HEIGHT / 2,
    );
    const scene: Scene = { P: proj(camera), front: facing(camera) };
    const { P } = scene;
    const onPanel = (u: number, v: number) =>
        P(CURVE_FROM[0] + u * CURVE_SIZE[0], PANEL_FACE_Y, CURVE_FROM[1] + v * CURVE_SIZE[1]);
    const dotRadius = r2(1.6 * camera.S);

    plinth(root, scene, PLINTH_X, PLINTH_Y, GROUND, GRID_STEP);

    const panelGroup = mk("g", {}, root);
    slab(solid(panelGroup), scene, PANEL_CENTRE, PANEL_HALF_X, 2, GROUND, PANEL_TOP - GROUND, 1.2);
    let panelGrid = "";
    for (let step = 0; step <= 4; step++) {
        panelGrid += seg(onPanel(step / 4, 0), onPanel(step / 4, 1));
        panelGrid += seg(onPanel(0, step / 4), onPanel(1, step / 4));
    }
    mk("path", { class: "nf lo", "stroke-dasharray": "1 2", d: panelGrid }, panelGroup);
    const curve = mk("path", { class: "nf accent" }, panelGroup);
    const curveDot = mk(
        "ellipse",
        { rx: dotRadius, ry: dotRadius, class: "dot accent" },
        panelGroup,
    );
    const outputTick = mk("path", { class: "nf accent" }, panelGroup);

    slab(solid(root), scene, [PRESS_X, COLUMN_Y], 7, 5, GROUND, COLUMN_TOP - GROUND, 2);
    slab(
        solid(root),
        scene,
        [(BELT_FROM + BELT_TO) / 2, 0],
        (BELT_TO - BELT_FROM) / 2,
        BELT_HALF_Y,
        GROUND,
        BELT_TOP - GROUND,
        2,
    );
    const rollers = mk("path", { class: "nf lo" }, root);
    const redlines = mk("path", { class: "nf accent", "stroke-dasharray": "2 2" }, root);

    slab(solid(root), scene, PAD_CENTRE, PAD_HALF, PAD_HALF, GROUND, PAD_TOP - GROUND, 3);
    const uiGroup = mk("g", {}, root);
    const sliderTrack = solid(uiGroup);
    const sliderFill = mk("path", { class: "nf accent" }, uiGroup);
    const sliderKnob = solid(uiGroup);
    const toggleTrack = solid(uiGroup);
    const toggleKnob = solid(uiGroup);
    const ripple = mk("ellipse", { class: "nf accent" }, root);

    const pieces = PIECES.map((piece) => {
        const element = solid(root);
        element.sil.style.stroke = piece.tone;
        return element;
    });
    const tile = solid(root);
    tile.sil.classList.add("filled");

    const rod = mk("path", { class: "nf mid" }, root);
    const head = solid(root);
    slab(
        solid(root),
        scene,
        [PRESS_X, (COLUMN_Y + 4) / 2],
        7,
        (4 - COLUMN_Y) / 2 + 2,
        ARM_FROM_Z,
        COLUMN_TOP - ARM_FROM_Z,
        2,
    );
    const cursor = mk("path", { class: "hi" }, root);

    let uiSeconds = 0;
    let lastSeconds = 0;

    function render(sceneProgress: number, seconds: number) {
        const dt = Math.max(0, seconds - lastSeconds);
        lastSeconds = seconds;
        uiSeconds = sceneProgress >= UI_FROM ? uiSeconds + dt : 0;

        const arrive = smooth(progress(sceneProgress, 0.04, 0.3));
        const pressDown = smooth(progress(sceneProgress, 0.34, 0.44));
        const align = smooth(progress(sceneProgress, 0.42, 0.56));
        const merge = progress(sceneProgress, 0.55, 0.6);
        const pressUp = smooth(progress(sceneProgress, 0.58, 0.66));
        const carry = smooth(progress(sceneProgress, 0.67, 0.82));

        const blockX = lerp(lerp(ARRIVE_FROM_X, PRESS_X, arrive), BUTTON_CENTRE[0], carry);
        const blockY = lerp(0, BUTTON_CENTRE[1], carry);
        const blockZ = lerp(
            BELT_TOP,
            PAD_TOP,
            progress(blockX, BELT_TO - 4, PAD_CENTRE[0] - PAD_HALF),
        );
        const travelled = blockX - ARRIVE_FROM_X + seconds * 4 * progress(sceneProgress, 0.9, 1);

        let rollerLines = "";
        for (
            let x = BELT_FROM + (travelled % ROLLER_SPACING) + 2;
            x < BELT_TO - 2;
            x += ROLLER_SPACING
        ) {
            rollerLines += seg(P(x, -BELT_HALF_Y + 3, BELT_TOP), P(x, BELT_HALF_Y - 3, BELT_TOP));
        }
        rollers.setAttribute("d", rollerLines);

        const contact = BELT_TOP + lerp(TALLEST_PIECE, SHAPED_HEIGHT, align);
        const headZ = lerp(HEAD_REST, contact, pressDown * (1 - pressUp));
        slab(head, scene, [PRESS_X, 0], HEAD_HALF, HEAD_HALF, headZ, HEAD_THICKNESS, 3);
        rod.setAttribute(
            "d",
            seg(P(PRESS_X, 0, headZ + HEAD_THICKNESS), P(PRESS_X, 0, ARM_FROM_Z)),
        );

        PIECES.forEach((piece, index) => {
            const element = pieces[index];
            setOpacity(element.g, (1 - merge) * Math.min(1, arrive * 6));
            const half = lerp(piece.half, PIECE_HALF, align);
            const height = Math.min(lerp(piece.height, SHAPED_HEIGHT, align), headZ - BELT_TOP);
            slab(
                element,
                scene,
                [
                    blockX + piece.home[0] + piece.drift[0] * (1 - align),
                    piece.home[1] + piece.drift[1] * (1 - align),
                ],
                half,
                half,
                blockZ,
                Math.max(0.6, height),
                lerp(0.4, 2, align),
            );
        });

        const measuring = Math.sin(Math.PI * progress(sceneProgress, 0.4, 0.66));
        setOpacity(redlines, measuring);
        if (measuring > 0) {
            const gap = 1 + 6 * (1 - align);
            const left = PRESS_X - TILE_HALF;
            const right = PRESS_X + TILE_HALF;
            const edge = -TILE_HALF - 7;
            const side = TILE_HALF + 7;
            redlines.setAttribute(
                "d",
                seg(P(left, edge, BELT_TOP), P(right, edge, BELT_TOP)) +
                    seg(P(left, edge - 3, BELT_TOP), P(left, edge + 3, BELT_TOP)) +
                    seg(P(right, edge - 3, BELT_TOP), P(right, edge + 3, BELT_TOP)) +
                    seg(P(right + 7, -TILE_HALF, BELT_TOP), P(right + 7, TILE_HALF, BELT_TOP)) +
                    seg(P(right + 4, -TILE_HALF, BELT_TOP), P(right + 10, -TILE_HALF, BELT_TOP)) +
                    seg(P(right + 4, TILE_HALF, BELT_TOP), P(right + 10, TILE_HALF, BELT_TOP)) +
                    seg(
                        P(PRESS_X - gap / 2, side, BELT_TOP + SHAPED_HEIGHT),
                        P(PRESS_X + gap / 2, side, BELT_TOP + SHAPED_HEIGHT),
                    ),
            );
        }

        const panelIn = smooth(progress(sceneProgress, 0.44, 0.52));
        setOpacity(panelGroup, panelIn);
        const drawn = progress(sceneProgress, 0.48, 0.64);
        curve.setAttribute(
            "d",
            drawn > 0
                ? open(
                      Array.from({ length: 33 }, (_, step) => {
                          const u = (drawn * step) / 32;
                          return onPanel(u, EASE(u));
                      }),
                  )
                : "",
        );
        const playhead = drawn >= 1 ? loopShare(seconds, 1.8) : drawn;
        place(curveDot, onPanel(playhead, EASE(playhead)));
        setOpacity(curveDot, drawn > 0 ? 1 : 0);
        outputTick.setAttribute(
            "d",
            drawn > 0 ? seg(onPanel(1.04, EASE(playhead)), onPanel(1.12, EASE(playhead))) : "",
        );

        const step = Math.floor(uiSeconds / STEP_SECONDS);
        const stepShare = (uiSeconds % STEP_SECONDS) / STEP_SECONDS;
        const target = step % 3;
        const press = uiSeconds > 0 ? progress(stepShare, 0.45, 1) : 0;
        const clickedButton = target === 0 ? press : 0;

        setOpacity(uiGroup, smooth(progress(sceneProgress, 0.8, 0.86)));

        const togglesBefore = Math.floor((step + 1) / 3);
        const wasOn = togglesBefore % 2 === 1;
        const flip = target === 1 ? smooth(progress(stepShare, 0.45, 0.65)) : 0;
        const toggleOn = flip > 0.5 ? !wasOn : wasOn;
        const toggleSide = (on: boolean) => (on ? TOGGLE_TRAVEL : -TOGGLE_TRAVEL);
        const toggleY = TOGGLE_CENTRE[1] + lerp(toggleSide(wasOn), toggleSide(!wasOn), flip);
        slab(toggleTrack, scene, TOGGLE_CENTRE, 6, 12, PAD_TOP, 2, 5.5);
        toggleTrack.sil.classList.toggle("accent", toggleOn);
        cylinder(toggleKnob, scene, [TOGGLE_CENTRE[0], toggleY], 4.2, PAD_TOP + 2, 2.4);

        const slidesBefore = Math.floor(step / 3);
        const sliderValue = (slides: number) =>
            slides === 0 ? SLIDER_REST : SLIDER_STOPS[(slides - 1) % SLIDER_STOPS.length];
        const slide = target === 2 ? EASE(progress(stepShare, 0.45, 0.9)) : 0;
        const sliderShare = lerp(sliderValue(slidesBefore), sliderValue(slidesBefore + 1), slide);
        const knobX = SLIDER_CENTRE[0] - SLIDER_HALF + sliderShare * SLIDER_HALF * 2;
        slab(sliderTrack, scene, SLIDER_CENTRE, SLIDER_HALF, 2, PAD_TOP, 1.2, 1.5);
        sliderFill.setAttribute(
            "d",
            seg(
                P(SLIDER_CENTRE[0] - SLIDER_HALF + 2, SLIDER_CENTRE[1], PAD_TOP + 1.2),
                P(knobX, SLIDER_CENTRE[1], PAD_TOP + 1.2),
            ),
        );
        cylinder(sliderKnob, scene, [knobX, SLIDER_CENTRE[1]], 4, PAD_TOP + 1.2, 3);

        const tileHalf = lerp(TILE_HALF, BUTTON_HALF, carry);
        const squash = bounce(clickedButton) * 0.3;
        setOpacity(tile.g, merge);
        slab(
            tile,
            scene,
            [blockX, blockY],
            tileHalf,
            tileHalf,
            blockZ,
            SHAPED_HEIGHT * (1 - squash),
            7,
        );

        const targets: Vec3[] = [
            [BUTTON_CENTRE[0], BUTTON_CENTRE[1], PAD_TOP + SHAPED_HEIGHT],
            [TOGGLE_CENTRE[0], toggleY, PAD_TOP + 4.4],
            [knobX, SLIDER_CENTRE[1], PAD_TOP + 4.2],
        ];
        const previous = targets[(target + 2) % 3];
        const current = targets[target];
        const travel = uiSeconds > 0 && step > 0 ? smooth(progress(stepShare, 0, 0.4)) : 1;
        const tipWorld: Vec3 = [0, 1, 2].map((axis) =>
            lerp(previous[axis], current[axis], travel),
        ) as Vec3;
        const tip = P(...tipWorld);
        const approach = smooth(progress(sceneProgress, UI_FROM - 0.02, UI_FROM + 0.02));
        const reach = 1 - approach;
        const dip = press > 0 && press < 0.5 ? 1.5 : 0;
        const cursorAt: Vec2 = [tip[0] + 34 * reach, tip[1] - 22 * reach + dip];
        cursor.setAttribute(
            "d",
            approach > 0 ? poly(CURSOR.map(([x, y]) => [cursorAt[0] + x, cursorAt[1] + y])) : "",
        );
        setOpacity(cursor, approach);

        const rippleShare = press > 0 && press < 1 ? press : 0;
        const rippleRadius = lerp(5, target === 0 ? BUTTON_HALF + 12 : 12, rippleShare);
        place(ripple, P(current[0], current[1], PAD_TOP));
        ripple.setAttribute("rx", String(r2(rippleRadius * camera.S * Math.SQRT2)));
        ripple.setAttribute("ry", String(r2(rippleRadius * camera.S * Math.SQRT2 * camera.k)));
        setOpacity(ripple, rippleShare > 0 ? clamp(1 - rippleShare, 0, 1) : 0);
    }

    return scrubbedFigure(els.stage, bag, value, render);
}
