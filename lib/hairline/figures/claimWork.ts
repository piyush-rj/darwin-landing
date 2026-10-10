import { Cam, facing, fit, lerp, open, proj, type Vec2 } from "../core/iso";
import { reducedMotion } from "../core/motion";
import { disposer, type FigureEls, type FigureHandle, mk, register, solid } from "../core/stage";
import {
    moveTag,
    plinth,
    prepareStage,
    progress,
    type Scene,
    setOpacity,
    slab,
    smooth,
    tag,
} from "./kit";

const WIDTH = 400;
const HEIGHT = 300;
const CYCLE_MS = 6200;
const STILL_FRAME_MS = 3600;
const GROUND = 5;
const PLINTH_X = 132;
const PLINTH_Y = 88;
const BOARD_TOP = GROUND + 4;
const BOARD_HALF_X = 116;
const BOARD_HALF_Y = 74;
const CARD_HALF_X = 28;
const CARD_HALF_Y = 16;
const CARD_THICKNESS = 3;
const LIFT = 18;

const LANES = [
    { name: "todo", x: -76 },
    { name: "in progress", x: 0 },
    { name: "done", x: 76 },
];
const LANE_DIVIDERS = [-38, 38];
const SLOTS_Y = [-44, 0, 44];

const LIFT_FROM_MS = 700;
const CARRY_FROM_MS = 1200;
const DROP_FROM_MS = 2500;
const CLAIMED_MS = 3000;
const RESET_FROM_MS = 5300;

export function mountClaimWork(els: FigureEls): FigureHandle {
    const bag = disposer();
    const root = prepareStage(els, bag, WIDTH, HEIGHT);
    const camera = Cam(45, 0.5, 1.08);
    fit(
        camera,
        [
            [-PLINTH_X, -PLINTH_Y, 0],
            [PLINTH_X, PLINTH_Y, 0],
            [-PLINTH_X, PLINTH_Y, 0],
            [PLINTH_X, -PLINTH_Y, 0],
            [-76, -BOARD_HALF_Y, 44],
        ],
        WIDTH / 2,
        HEIGHT / 2 + 6,
    );
    const scene: Scene = { P: proj(camera), front: facing(camera) };
    const { P } = scene;

    plinth(root, scene, PLINTH_X, PLINTH_Y, GROUND, 22);
    slab(solid(root), scene, [0, 0], BOARD_HALF_X, BOARD_HALF_Y, GROUND, BOARD_TOP - GROUND, 6);
    mk(
        "path",
        {
            d: LANE_DIVIDERS.map((x) =>
                open([P(x, -BOARD_HALF_Y + 6, BOARD_TOP), P(x, BOARD_HALF_Y - 6, BOARD_TOP)]),
            ).join(""),
            class: "nf lo",
            "stroke-dasharray": "1 3",
        },
        root,
    );

    const todoCards = SLOTS_Y.map((y) => {
        const card = solid(root);
        slab(card, scene, [LANES[0].x, y], CARD_HALF_X, CARD_HALF_Y, BOARD_TOP, CARD_THICKNESS);
        return card;
    });
    SLOTS_Y.slice(0, 2).forEach((y) => {
        slab(
            solid(root),
            scene,
            [LANES[2].x, y],
            CARD_HALF_X,
            CARD_HALF_Y,
            BOARD_TOP,
            CARD_THICKNESS,
        );
    });

    const shadow = mk("path", { class: "nf mid", "stroke-dasharray": "2 3" }, root);
    const carried = solid(root);

    const labels = mk("g", {}, root);
    const laneTags = LANES.map((lane) =>
        tag(labels, scene, [lane.x, -BOARD_HALF_Y + 4, BOARD_TOP], lane.name, 26),
    );
    const agentTag = tag(labels, scene, [0, 0, 0], "darwin", 26);
    agentTag.label.classList.add("on");

    function render(elapsed: number) {
        const t = elapsed % CYCLE_MS;
        const claimedSlot = Math.floor(elapsed / CYCLE_MS) % SLOTS_Y.length;
        const y = SLOTS_Y[claimedSlot];
        const lift = smooth(progress(t, LIFT_FROM_MS, CARRY_FROM_MS));
        const carry = smooth(progress(t, CARRY_FROM_MS, DROP_FROM_MS));
        const drop = smooth(progress(t, DROP_FROM_MS, CLAIMED_MS));
        const reset = progress(t, RESET_FROM_MS, CYCLE_MS - 200);
        const height = LIFT * lift * (1 - drop);
        const centre: Vec2 = [lerp(LANES[0].x, LANES[1].x, carry), y];
        const claimed = t >= CLAIMED_MS;

        todoCards.forEach((card, index) => {
            const isClaimed = index === claimedSlot;
            setOpacity(card.g, isClaimed ? (t < LIFT_FROM_MS ? 1 : reset) : 1);
            card.sil.classList.toggle("accent", isClaimed && t > 200 && t < LIFT_FROM_MS);
        });

        const moving = t >= LIFT_FROM_MS;
        setOpacity(carried.g, moving ? 1 - reset : 0);
        carried.sil.classList.toggle("filled", claimed);
        carried.sil.classList.toggle("accent", moving && !claimed);
        slab(carried, scene, centre, CARD_HALF_X, CARD_HALF_Y, BOARD_TOP + height, CARD_THICKNESS);

        const airborne = height > 0.5;
        setOpacity(shadow, airborne ? 1 : 0);
        shadow.setAttribute(
            "d",
            airborne
                ? open(
                      [
                          [centre[0] - CARD_HALF_X, y - CARD_HALF_Y],
                          [centre[0] + CARD_HALF_X, y - CARD_HALF_Y],
                          [centre[0] + CARD_HALF_X, y + CARD_HALF_Y],
                          [centre[0] - CARD_HALF_X, y + CARD_HALF_Y],
                          [centre[0] - CARD_HALF_X, y - CARD_HALF_Y],
                      ].map((point) => P(point[0], point[1], BOARD_TOP)),
                  )
                : "",
        );

        moveTag(agentTag, scene, [centre[0], y, BOARD_TOP + height + CARD_THICKNESS], 26);
        agentTag.label.textContent = claimed ? "claimed by darwin" : "darwin";
        setOpacity(agentTag.label, moving ? 1 - reset : 0);
        setOpacity(agentTag.leader, moving ? 1 - reset : 0);

        laneTags[0].label.classList.toggle("on", t < CARRY_FROM_MS);
        laneTags[1].label.classList.toggle("on", t >= CARRY_FROM_MS && t < RESET_FROM_MS);
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
