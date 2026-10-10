import { Cam, facing, fit, lerp, open, proj, type Vec2 } from "../core/iso";
import { reducedMotion } from "../core/motion";
import { disposer, type FigureEls, type FigureHandle, mk, register, solid } from "../core/stage";
import { plinth, prepareStage, progress, type Scene, setOpacity, slab, smooth, tag } from "./kit";

const WIDTH = 400;
const HEIGHT = 300;
const CYCLE_MS = 6400;
const STILL_FRAME_MS = 5000;
const GROUND = 5;
const PLINTH_X = 128;
const PLINTH_Y = 86;
const PAD_HALF = 14;
const PAD_TOP = GROUND + 8;
const BOARD_TOP = GROUND + 4;
const PACKET_HALF = 5;
const TRAVEL_MS = 1100;
const ARRIVAL_GAP_MS = 1300;
const FIRST_DEPARTURE_MS = 300;
const FADE_OUT_FROM_MS = 5300;

const SOURCES: { name: string; pad: Vec2 }[] = [
    { name: "slack", pad: [-84, -50] },
    { name: "telegram", pad: [-84, 4] },
    { name: "figma", pad: [-84, 58] },
];

const BOARD_X = 64;
const BOARD_Y = 2;
const BOARD_HALF_X = 50;
const BOARD_HALF_Y = 66;
const LANE_DIVIDERS = [47, 81];
const BACKLOG_X = 30;
const SLOTS = [-38, 2, 42];

export function mountIssueIntake(els: FigureEls): FigureHandle {
    const bag = disposer();
    const root = prepareStage(els, bag, WIDTH, HEIGHT);
    const camera = Cam(45, 0.5, 1.12);
    fit(
        camera,
        [
            [-PLINTH_X, -PLINTH_Y, 0],
            [PLINTH_X, PLINTH_Y, 0],
            [-PLINTH_X, PLINTH_Y, 0],
            [PLINTH_X, -PLINTH_Y, 0],
            [-84, -50, 40],
        ],
        WIDTH / 2,
        HEIGHT / 2 + 8,
    );
    const scene: Scene = { P: proj(camera), front: facing(camera) };
    const { P } = scene;

    plinth(root, scene, PLINTH_X, PLINTH_Y, GROUND, 21.3);

    const routes = SOURCES.map((source, index): Vec2[] => [source.pad, [BACKLOG_X, SLOTS[index]]]);
    const routePaths = routes.map((route) =>
        mk(
            "path",
            {
                d: open(route.map((point) => P(point[0], point[1], GROUND))),
                class: "nf mid",
                "stroke-dasharray": "2 3",
            },
            root,
        ),
    );

    const pads = SOURCES.map((source) => {
        const pad = solid(root);
        slab(pad, scene, source.pad, PAD_HALF, PAD_HALF, GROUND, PAD_TOP - GROUND, 4);
        return pad;
    });

    const board = solid(root);
    slab(
        board,
        scene,
        [BOARD_X, BOARD_Y],
        BOARD_HALF_X,
        BOARD_HALF_Y,
        GROUND,
        BOARD_TOP - GROUND,
        6,
    );
    mk(
        "path",
        {
            d: LANE_DIVIDERS.map((x) =>
                open([
                    P(x, BOARD_Y - BOARD_HALF_Y + 6, BOARD_TOP),
                    P(x, BOARD_Y + BOARD_HALF_Y - 6, BOARD_TOP),
                ]),
            ).join(""),
            class: "nf lo",
            "stroke-dasharray": "1 3",
        },
        root,
    );

    const cards = SLOTS.map(() => {
        const card = solid(root);
        card.sil.classList.add("filled");
        return card;
    });
    const packets = SOURCES.map(() => {
        const packet = solid(root);
        packet.sil.classList.add("filled");
        return packet;
    });

    const labels = mk("g", {}, root);
    const sourceTags = SOURCES.map((source) =>
        tag(labels, scene, [source.pad[0], source.pad[1], PAD_TOP], source.name, 20),
    );
    const backlogTag = tag(
        labels,
        scene,
        [BACKLOG_X, BOARD_Y - BOARD_HALF_Y + 4, BOARD_TOP],
        "backlog",
        30,
    );
    backlogTag.label.classList.add("on");

    function render(elapsed: number) {
        const t = elapsed % CYCLE_MS;
        const fadeOut = 1 - progress(t, FADE_OUT_FROM_MS, CYCLE_MS - 300);
        let landed = 0;
        SOURCES.forEach((_, index) => {
            const departure = FIRST_DEPARTURE_MS + index * ARRIVAL_GAP_MS;
            const travel = progress(t, departure, departure + TRAVEL_MS);
            const eased = smooth(travel);
            const route = routes[index];
            const point: Vec2 = [
                lerp(route[0][0], route[1][0], eased),
                lerp(route[0][1], route[1][1], eased),
            ];
            const packet = packets[index];
            const inFlight = travel > 0 && travel < 1;
            setOpacity(packet.g, inFlight ? Math.min(1, travel * 8, (1 - travel) * 8) : 0);
            slab(packet, scene, point, PACKET_HALF, PACKET_HALF, PAD_TOP + 1, 2.4);
            routePaths[index].classList.toggle("accent", inFlight);
            pads[index].sil.classList.toggle("accent", travel > 0 && travel < 0.4);
            sourceTags[index].label.classList.toggle("on", travel > 0 && travel < 0.6);

            const settled = progress(t, departure + TRAVEL_MS - 120, departure + TRAVEL_MS + 260);
            if (settled > 0) landed++;
            const card = cards[index];
            setOpacity(card.g, Math.min(settled, fadeOut));
            slab(
                card,
                scene,
                [BACKLOG_X, SLOTS[index]],
                lerp(PACKET_HALF, 12, settled),
                lerp(PACKET_HALF, 15, settled),
                BOARD_TOP + lerp(6, 0, settled),
                2.4,
            );
        });
        backlogTag.label.textContent = landed ? `backlog · ${landed} new` : "backlog";
        setOpacity(backlogTag.label, t > FADE_OUT_FROM_MS ? fadeOut : 1);
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
