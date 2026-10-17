import { Cam, facing, fit, open, proj, r2, seg, type Vec2, type Vec3 } from "../core/iso";
import { disposer, type FigureEls, type FigureHandle, mk, place, solid } from "../core/stage";
import {
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
const PLINTH_HALF = 120;
const GRID_STEP = 24;
const DOT_RADIUS = 1.3;

const BOARD_CENTRE: Vec2 = [-55, 45];
const BOARD_HALF_X = 38;
const BOARD_HALF_Y = 28;
const BOARD_TOP = GROUND + 3;
const COLUMN_DIVIDERS_X = [-67.5, -42.5];
const COLUMNS_X = [-80, -55, -30];
const ROWS_Y = [30, 45, 60];
const CARD_HALF_X = 8;
const CARD_HALF_Y = 5.5;
const CARD_THICKNESS = 1.6;
const CARD_DROP = 46;

const STACK_CENTRE: Vec2 = [40, -35];
const STACK_HALF = 32;
const LAYER_PORTS = [3, 5, 4, 6];
const LAYER_THICKNESS = 8;
const LAYER_PITCH = 11;
const LAYER_SLIDE = 70;
const PORT_SPACING = 6;
const STACK_TOP = GROUND + LAYER_PORTS.length * LAYER_PITCH;
const STACK_FRONT_Y = STACK_CENTRE[1] + STACK_HALF;
const STACK_SIDE_X = STACK_CENTRE[0] + STACK_HALF;

const RAIL_X = STACK_SIDE_X + 9;
const RAIL_TOP = STACK_TOP + 8;
const CARRIAGE_THICKNESS = 4;

const TRAY_CENTRE: Vec2 = [78, 62];
const TRAY_HALF = 14;
const TRAY_TOP = GROUND + 3;
const PLATE_HALF = 9;
const PLATE_THICKNESS = 1.6;
const PLATE_PITCH = 2.4;
const MAX_PLATES = 4;
const SECONDS_PER_PLATE = 3.5;

const WIRE_Z = GROUND + 0.4;
const INTAKE_WIRE: Vec3[] = [
    [BOARD_CENTRE[0] + BOARD_HALF_X, 45, WIRE_Z],
    [24, 45, WIRE_Z],
    [24, STACK_FRONT_Y, WIRE_Z],
];
const SHIP_WIRE: Vec3[] = [
    [56, STACK_FRONT_Y, WIRE_Z],
    [56, TRAY_CENTRE[1], WIRE_Z],
    [TRAY_CENTRE[0] - TRAY_HALF, TRAY_CENTRE[1], WIRE_Z],
];
const PACKETS_PER_WIRE = 3;

const LAYERS_FROM = 0.38;
const LAYER_STAGGER = 0.06;
const LAYER_SPAN = 0.08;

function partialRoute(route: Vec3[], share: number): Vec3[] {
    if (share <= 0) return [];
    const steps = 24;
    return Array.from({ length: steps + 1 }, (_, step) =>
        pointAlong3(route, (share * step) / steps),
    );
}

export function mountFoundingStack(els: FigureEls, value: number): FigureHandle {
    const bag = disposer();
    const root = prepareStage(els, bag, WIDTH, HEIGHT);
    const camera = Cam(45, 0.5, 1.12);
    fit(
        camera,
        [
            [-PLINTH_HALF, -PLINTH_HALF, 0],
            [PLINTH_HALF, PLINTH_HALF, 0],
            [-PLINTH_HALF, PLINTH_HALF, 0],
            [PLINTH_HALF, -PLINTH_HALF, 0],
            [STACK_CENTRE[0], STACK_CENTRE[1], RAIL_TOP + 10],
        ],
        WIDTH / 2,
        HEIGHT / 2,
    );
    const scene: Scene = { P: proj(camera), front: facing(camera) };
    const { P } = scene;
    const dotRadius = r2(DOT_RADIUS * camera.S);
    const at = (point: Vec3) => P(point[0], point[1], point[2]);
    const dot = (parent: Element, className: string) =>
        mk("ellipse", { rx: dotRadius, ry: dotRadius, class: className }, parent);

    plinth(root, scene, PLINTH_HALF, PLINTH_HALF, GROUND, GRID_STEP);

    const intakeWire = mk("path", { class: "nf mid", "stroke-dasharray": "2 3" }, root);
    const shipWire = mk("path", { class: "nf mid", "stroke-dasharray": "2 3" }, root);

    const boardGroup = mk("g", {}, root);
    slab(solid(boardGroup), scene, BOARD_CENTRE, BOARD_HALF_X, BOARD_HALF_Y, GROUND, 3, 3);
    mk(
        "path",
        {
            class: "nf lo",
            "stroke-dasharray": "1 2",
            d: COLUMN_DIVIDERS_X.map((x) =>
                seg(
                    P(x, BOARD_CENTRE[1] - BOARD_HALF_Y + 4, BOARD_TOP),
                    P(x, BOARD_CENTRE[1] + BOARD_HALF_Y - 4, BOARD_TOP),
                ),
            ).join(""),
        },
        boardGroup,
    );
    const cards = Array.from({ length: 4 }, (_, index) => {
        const card = solid(boardGroup);
        if (index === 0) card.sil.classList.add("filled");
        return card;
    });

    const layers = LAYER_PORTS.map((ports, index) => {
        const group = mk("g", {}, root);
        return {
            group,
            body: solid(group),
            ports: Array.from({ length: ports }, () => dot(group, "dot m")),
            contact: dot(group, "dot off"),
            z: GROUND + index * LAYER_PITCH,
        };
    });

    const railGroup = mk("g", {}, root);
    const rail = solid(railGroup);
    const arm = mk("path", { class: "nf accent" }, railGroup);
    const carriage = solid(railGroup);
    carriage.sil.classList.add("accent");

    const trayGroup = mk("g", {}, root);
    slab(solid(trayGroup), scene, TRAY_CENTRE, TRAY_HALF, TRAY_HALF, GROUND, TRAY_TOP - GROUND, 3);
    const plates = Array.from({ length: MAX_PLATES }, () => {
        const plate = solid(trayGroup);
        plate.sil.classList.add("filled");
        return plate;
    });
    const shippingPlate = solid(root);
    shippingPlate.sil.classList.add("filled");

    const intakePackets = Array.from({ length: PACKETS_PER_WIRE }, () => dot(root, "dot accent"));
    const shipPackets = Array.from({ length: PACKETS_PER_WIRE }, () => dot(root, "dot accent"));

    function placeCard(index: number, column: number, row: number, drop: number) {
        setOpacity(cards[index].g, drop * 4);
        slab(
            cards[index],
            scene,
            [column, ROWS_Y[row]],
            CARD_HALF_X,
            CARD_HALF_Y,
            BOARD_TOP + (1 - drop) * CARD_DROP,
            CARD_THICKNESS,
            1.2,
        );
    }

    function flowPackets(
        packets: SVGEllipseElement[],
        route: Vec3[],
        drawn: number,
        seconds: number,
        period: number,
    ) {
        packets.forEach((packet, index) => {
            const share = loopShare(seconds, period, index / packets.length);
            place(packet, at(pointAlong3(route, share)));
            setOpacity(packet, drawn >= 1 ? Math.min(1, share * 8, (1 - share) * 8) : 0);
        });
    }

    function render(sceneProgress: number, seconds: number) {
        const settled = progress(sceneProgress, 0.92, 1);
        setOpacity(boardGroup, progress(sceneProgress, 0, 0.06));

        const firstDrop = smooth(progress(sceneProgress, 0.06, 0.2));
        const toProgress = smooth(progress(sceneProgress, 0.24, 0.32));
        const toDone = smooth(progress(sceneProgress, 0.84, 0.92));
        const firstColumn =
            COLUMNS_X[0] +
            (COLUMNS_X[1] - COLUMNS_X[0]) * toProgress +
            (COLUMNS_X[2] - COLUMNS_X[1]) * toDone;
        placeCard(0, firstColumn, 0, firstDrop);
        for (let index = 1; index < cards.length; index++) {
            const start = 0.9 + (index - 1) * 0.025;
            placeCard(
                index,
                COLUMNS_X[0],
                index - 1,
                smooth(progress(sceneProgress, start, start + 0.04)),
            );
        }

        const intakeDrawn = progress(sceneProgress, 0.32, 0.4);
        const shipDrawn = progress(sceneProgress, 0.78, 0.84);
        intakeWire.setAttribute("d", open(partialRoute(INTAKE_WIRE, intakeDrawn).map(at)));
        shipWire.setAttribute("d", open(partialRoute(SHIP_WIRE, shipDrawn).map(at)));
        intakeWire.setAttribute("stroke-dashoffset", String(r2(-seconds * 6)));
        shipWire.setAttribute("stroke-dashoffset", String(r2(-seconds * 6)));

        const railsIn = smooth(progress(sceneProgress, 0.64, 0.68));
        const firstClimb = smooth(progress(sceneProgress, 0.68, 0.8));
        const patrol = 0.5 - 0.5 * Math.cos(seconds * 0.9);
        const climb = firstClimb < 1 ? firstClimb : 1 - settled * (1 - patrol);
        const carriageZ = GROUND + climb * (RAIL_TOP - GROUND - CARRIAGE_THICKNESS);

        layers.forEach((layer, index) => {
            const start = LAYERS_FROM + index * LAYER_STAGGER;
            const arrive = smooth(progress(sceneProgress, start, start + LAYER_SPAN));
            const x = STACK_CENTRE[0] + LAYER_SLIDE * (1 - arrive);
            const middle = layer.z + LAYER_THICKNESS / 2;
            setOpacity(layer.group, progress(sceneProgress, start, start + 0.02));
            slab(
                layer.body,
                scene,
                [x, STACK_CENTRE[1]],
                STACK_HALF,
                STACK_HALF,
                layer.z,
                LAYER_THICKNESS,
                3,
            );
            layer.ports.forEach((port, portIndex) => {
                place(
                    port,
                    P(x - STACK_HALF + 8 + portIndex * PORT_SPACING, STACK_FRONT_Y, middle),
                );
                const blinking = Math.sin(seconds * (2.2 + index * 0.7) + portIndex * 1.9) > 0.35;
                port.classList.toggle("m", !(arrive >= 1 && blinking));
            });
            place(layer.contact, P(x + STACK_HALF, STACK_CENTRE[1], middle));
            const touched = railsIn > 0.5 && carriageZ + CARRIAGE_THICKNESS / 2 >= middle;
            const lit = firstClimb >= 1 || touched;
            layer.contact.classList.toggle("off", !lit);
            layer.contact.classList.toggle("accent", lit);
        });

        setOpacity(railGroup, railsIn);
        slab(
            rail,
            scene,
            [RAIL_X, STACK_CENTRE[1]],
            1.6,
            1.6,
            GROUND,
            Math.max(0.4, (RAIL_TOP - GROUND) * railsIn),
            0.8,
        );
        slab(carriage, scene, [RAIL_X, STACK_CENTRE[1]], 3.2, 6, carriageZ, CARRIAGE_THICKNESS, 1);
        const armZ = Math.min(carriageZ + CARRIAGE_THICKNESS / 2, STACK_TOP - 2);
        arm.setAttribute(
            "d",
            seg(P(RAIL_X - 3.2, STACK_CENTRE[1], armZ), P(STACK_SIDE_X, STACK_CENTRE[1], armZ)),
        );

        setOpacity(trayGroup, progress(sceneProgress, 0.78, 0.82));
        const ship = smooth(progress(sceneProgress, 0.8, 0.9));
        const shipping = ship > 0 && ship < 1;
        setOpacity(shippingPlate.g, shipping ? 1 : 0);
        if (shipping) {
            const point = pointAlong3([...SHIP_WIRE, [...TRAY_CENTRE, TRAY_TOP]], ship);
            slab(
                shippingPlate,
                scene,
                [point[0], point[1]],
                PLATE_HALF,
                PLATE_HALF,
                point[2] + 1,
                PLATE_THICKNESS,
                1,
            );
        }
        const landed =
            ship >= 1 ? 1 + (Math.floor((settled * seconds) / SECONDS_PER_PLATE) % MAX_PLATES) : 0;
        plates.forEach((plate, index) => {
            setOpacity(plate.g, index < landed ? 1 : 0);
            slab(
                plate,
                scene,
                TRAY_CENTRE,
                PLATE_HALF,
                PLATE_HALF,
                TRAY_TOP + index * PLATE_PITCH,
                PLATE_THICKNESS,
                1,
            );
        });

        flowPackets(intakePackets, INTAKE_WIRE, intakeDrawn, seconds, 3.2);
        flowPackets(shipPackets, SHIP_WIRE, shipDrawn, seconds, 2.6);
    }

    return scrubbedFigure(els.stage, bag, value, render);
}
