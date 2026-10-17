import {
    circ,
    clamp,
    lerp,
    prism,
    type Projector,
    r2,
    rings,
    type Sample,
    seg,
    type Vec2,
    type Vec3,
} from "../core/iso";
import { reducedMotion, spring, stepS } from "../core/motion";
import {
    type Disposer,
    type FigureEls,
    type FigureHandle,
    mk,
    put,
    register,
    type Solid,
    solid,
} from "../core/stage";

export const progress = (t: number, from: number, to: number) =>
    clamp((t - from) / (to - from), 0, 1);

export const smooth = (p: number) => (1 - Math.cos(Math.PI * p)) / 2;

export function pointAlong(route: Vec2[], p: number): Vec2 {
    const lengths = route
        .slice(1)
        .map((point, index) => Math.hypot(point[0] - route[index][0], point[1] - route[index][1]));
    let remaining = clamp(p, 0, 1) * lengths.reduce((sum, length) => sum + length, 0);
    for (let index = 0; index < lengths.length; index++) {
        if (remaining <= lengths[index]) {
            const share = lengths[index] === 0 ? 0 : remaining / lengths[index];
            return [
                lerp(route[index][0], route[index + 1][0], share),
                lerp(route[index][1], route[index + 1][1], share),
            ];
        }
        remaining -= lengths[index];
    }
    return route[route.length - 1];
}

export const square = (centre: Vec2, half: number, radius: number, bevel: number) =>
    rings(centre[0] - half, centre[1] - half, centre[0] + half, centre[1] + half, radius, bevel);

export const box = (centre: Vec2, halfX: number, halfY: number, radius: number, bevel: number) =>
    rings(
        centre[0] - halfX,
        centre[1] - halfY,
        centre[0] + halfX,
        centre[1] + halfY,
        radius,
        bevel,
    );

export type Scene = { P: Projector; front: (q: Sample) => boolean };

export function slab(
    element: Solid,
    { P, front }: Scene,
    centre: Vec2,
    halfX: number,
    halfY: number,
    z: number,
    thickness: number,
    radius = 1.6,
) {
    const [ring, inner] = box(centre, halfX, halfY, radius, Math.min(radius, 0.8));
    put(element, prism(P, front, ring, inner, z, z + thickness));
}

export function prepareStage(
    { stage, svg }: FigureEls,
    bag: Disposer,
    width: number,
    height: number,
) {
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const restingAspect = stage.style.aspectRatio;
    stage.style.aspectRatio = `${width} / ${height}`;
    bag.add(() => {
        stage.style.aspectRatio = restingAspect;
    });
    bag.add(() => svg.replaceChildren());
    return mk("g", {}, svg);
}

export function plinth(
    parent: Element,
    scene: Scene,
    halfX: number,
    halfY: number,
    ground: number,
    gridStep: number,
) {
    const group = mk("g", {}, parent);
    slab(solid(group), scene, [0, 0], halfX, halfY, 0, ground, 10);
    let grid = "";
    for (let x = -halfX + gridStep; x < halfX - 1; x += gridStep) {
        grid += seg(scene.P(x, -halfY + 6, ground), scene.P(x, halfY - 6, ground));
    }
    for (let y = -halfY + gridStep; y < halfY - 1; y += gridStep) {
        grid += seg(scene.P(-halfX + 6, y, ground), scene.P(halfX - 6, y, ground));
    }
    mk("path", { d: grid, class: "nf lo", "stroke-dasharray": "1 3" }, group);
    return group;
}

export function tag(parent: Element, scene: Scene, at: Vec3, text: string, lift = 22) {
    const foot = scene.P(at[0], at[1], at[2]);
    const leader = mk(
        "path",
        { d: seg(foot, [foot[0], foot[1] - lift + 3]), class: "nf lo", "stroke-dasharray": "1 2" },
        parent,
    );
    const label = mk(
        "text",
        {
            class: "hairline-label",
            "text-anchor": "middle",
            x: r2(foot[0]),
            y: r2(foot[1] - lift),
        },
        parent,
    );
    label.textContent = text;
    return { label, leader };
}

export function moveTag(
    { label, leader }: ReturnType<typeof tag>,
    scene: Scene,
    at: Vec3,
    lift = 22,
) {
    const foot = scene.P(at[0], at[1], at[2]);
    leader.setAttribute("d", seg(foot, [foot[0], foot[1] - lift + 3]));
    label.setAttribute("x", String(r2(foot[0])));
    label.setAttribute("y", String(r2(foot[1] - lift)));
}

export const setOpacity = (element: Element, value: number) =>
    element.setAttribute("opacity", String(r2(clamp(value, 0, 1))));

export function scrubbedFigure(
    stage: HTMLElement,
    bag: Disposer,
    initial: number,
    render: (progress: number, seconds: number) => void,
): FigureHandle {
    const shown = spring(clamp(initial, 0, 1), { k: 160, c: 26, eps: 0.0005 });
    let seconds = 0;
    const loop = register(stage, (dt) => {
        const moving = stepS(shown, dt);
        if (!reducedMotion()) seconds += dt;
        render(shown.x, seconds);
        return moving || !reducedMotion();
    });
    bag.add(loop.unregister);
    return {
        set(value: number) {
            shown.t = clamp(value, 0, 1);
            loop.wake();
        },
        destroy: bag.dispose,
    };
}

export function pointAlong3(route: Vec3[], share: number): Vec3 {
    const lengths = route
        .slice(1)
        .map((point, index) =>
            Math.hypot(
                point[0] - route[index][0],
                point[1] - route[index][1],
                point[2] - route[index][2],
            ),
        );
    let remaining = clamp(share, 0, 1) * lengths.reduce((sum, length) => sum + length, 0);
    for (let index = 0; index < lengths.length; index++) {
        if (remaining <= lengths[index]) {
            const part = lengths[index] === 0 ? 0 : remaining / lengths[index];
            return [0, 1, 2].map((axis) =>
                lerp(route[index][axis], route[index + 1][axis], part),
            ) as Vec3;
        }
        remaining -= lengths[index];
    }
    return route[route.length - 1];
}

export function cylinder(
    element: Solid,
    { P, front }: Scene,
    centre: Vec2,
    radius: number,
    z: number,
    height: number,
) {
    const ring = circ(radius, 48).map((sample) => ({
        ...sample,
        u: sample.u + centre[0],
        v: sample.v + centre[1],
    }));
    const inner = circ(Math.max(0.5, radius - 1.4), 48).map((sample) => ({
        ...sample,
        u: sample.u + centre[0],
        v: sample.v + centre[1],
    }));
    put(element, prism(P, front, ring, inner, z, z + height));
}

export const loopShare = (seconds: number, period: number, offset = 0) =>
    (((seconds / period + offset) % 1) + 1) % 1;
