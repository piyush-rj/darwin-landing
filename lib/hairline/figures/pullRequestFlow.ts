import { Cam, facing, fit, lerp, open, proj, type Vec2 } from "../core/iso";
import { reducedMotion } from "../core/motion";
import { disposer, type FigureEls, type FigureHandle, mk, register, solid } from "../core/stage";
import {
    moveTag,
    plinth,
    pointAlong,
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
const CYCLE_MS = 8200;
const STILL_FRAME_MS = 6600;
const GROUND = 5;
const PLINTH_X = 134;
const PLINTH_Y = 84;
const COMMIT_HALF = 6;
const COMMIT_THICKNESS = 3;
const MAIN_Y = 36;
const BRANCH_Y = -28;
const MAIN_COMMITS_X = [-100, -60, -20, 20, 60];
const MERGE_COMMIT_X = 100;
const BRANCH_COMMITS_X = [-18, 14, 46];
const PR_CENTRE: Vec2 = [88, BRANCH_Y];
const REVIEWER: Vec2 = [88, -72];

const BRANCH_ROUTE: Vec2[] = [
    [-60, MAIN_Y],
    [-40, BRANCH_Y],
    [PR_CENTRE[0] - 16, BRANCH_Y],
];
const MERGE_ROUTE: Vec2[] = [
    [PR_CENTRE[0] + 4, BRANCH_Y + 12],
    [MERGE_COMMIT_X, MAIN_Y - 8],
];
const REVIEW_ROUTE: Vec2[] = [REVIEWER, [PR_CENTRE[0], BRANCH_Y - 12]];

const BRANCH_FROM_MS = 400;
const BRANCH_MS = 2400;
const PR_FROM_MS = 2900;
const PR_MS = 600;
const REVIEW_FROM_MS = 3700;
const REVIEW_MS = 900;
const MERGE_FROM_MS = 5000;
const MERGE_MS = 900;
const RESET_FROM_MS = 7300;

const routeLength = (route: Vec2[]) =>
    route
        .slice(1)
        .reduce(
            (sum, point, index) =>
                sum + Math.hypot(point[0] - route[index][0], point[1] - route[index][1]),
            0,
        );

export function mountPullRequestFlow(els: FigureEls): FigureHandle {
    const bag = disposer();
    const root = prepareStage(els, bag, WIDTH, HEIGHT);
    const camera = Cam(45, 0.5, 1.06);
    fit(
        camera,
        [
            [-PLINTH_X, -PLINTH_Y, 0],
            [PLINTH_X, PLINTH_Y, 0],
            [-PLINTH_X, PLINTH_Y, 0],
            [PLINTH_X, -PLINTH_Y, 0],
            [REVIEWER[0], REVIEWER[1], 40],
        ],
        WIDTH / 2,
        HEIGHT / 2 + 4,
    );
    const scene: Scene = { P: proj(camera), front: facing(camera) };
    const { P } = scene;
    const onGround = (route: Vec2[]) => open(route.map((point) => P(point[0], point[1], GROUND)));
    const partial = (route: Vec2[], share: number) =>
        share <= 0
            ? ""
            : onGround(
                  Array.from({ length: 24 }, (_, index) => pointAlong(route, (share * index) / 23)),
              );

    plinth(root, scene, PLINTH_X, PLINTH_Y, GROUND, 22.3);
    mk(
        "path",
        {
            d: onGround([
                [-PLINTH_X + 12, MAIN_Y],
                [PLINTH_X - 12, MAIN_Y],
            ]),
            class: "nf mid",
        },
        root,
    );
    const branchPath = mk("path", { class: "nf accent" }, root);
    const reviewPath = mk("path", { class: "nf accent", "stroke-dasharray": "2 3" }, root);
    const mergePath = mk("path", { class: "nf accent" }, root);

    MAIN_COMMITS_X.forEach((x) => {
        slab(
            solid(root),
            scene,
            [x, MAIN_Y],
            COMMIT_HALF,
            COMMIT_HALF,
            GROUND,
            COMMIT_THICKNESS,
            3,
        );
    });
    const mergeCommit = solid(root);
    slab(
        mergeCommit,
        scene,
        [MERGE_COMMIT_X, MAIN_Y],
        COMMIT_HALF,
        COMMIT_HALF,
        GROUND,
        COMMIT_THICKNESS,
        3,
    );

    const reviewer = solid(root);
    slab(reviewer, scene, REVIEWER, 12, 12, GROUND, 8, 4);

    const branchCommits = BRANCH_COMMITS_X.map((x) => {
        const commit = solid(root);
        commit.sil.classList.add("filled");
        slab(commit, scene, [x, BRANCH_Y], COMMIT_HALF, COMMIT_HALF, GROUND, COMMIT_THICKNESS, 3);
        return commit;
    });
    const pullRequest = solid(root);

    const labels = mk("g", {}, root);
    tag(labels, scene, [-PLINTH_X + 16, MAIN_Y, GROUND], "main", 18);
    const branchTag = tag(
        labels,
        scene,
        [BRANCH_COMMITS_X[0], BRANCH_Y, GROUND + 3],
        "darwin/fix-142",
        22,
    );
    const reviewerTag = tag(labels, scene, [REVIEWER[0], REVIEWER[1], GROUND + 8], "you", 18);
    const pullRequestTag = tag(labels, scene, [PR_CENTRE[0], PR_CENTRE[1], GROUND + 6], "", 34);
    pullRequestTag.label.classList.add("on");

    const branchLength = routeLength(BRANCH_ROUTE);
    const commitShares = BRANCH_COMMITS_X.map((x) => {
        const first = Math.hypot(
            BRANCH_ROUTE[1][0] - BRANCH_ROUTE[0][0],
            BRANCH_ROUTE[1][1] - BRANCH_ROUTE[0][1],
        );
        return (first + (x - BRANCH_ROUTE[1][0])) / branchLength;
    });

    function render(elapsed: number) {
        const t = elapsed % CYCLE_MS;
        const fade = 1 - progress(t, RESET_FROM_MS, CYCLE_MS - 200);
        const branch = smooth(progress(t, BRANCH_FROM_MS, BRANCH_FROM_MS + BRANCH_MS));
        const opened = smooth(progress(t, PR_FROM_MS, PR_FROM_MS + PR_MS));
        const review = smooth(progress(t, REVIEW_FROM_MS, REVIEW_FROM_MS + REVIEW_MS));
        const merge = smooth(progress(t, MERGE_FROM_MS, MERGE_FROM_MS + MERGE_MS));

        branchPath.setAttribute("d", partial(BRANCH_ROUTE, branch));
        reviewPath.setAttribute("d", partial(REVIEW_ROUTE, review));
        mergePath.setAttribute("d", partial(MERGE_ROUTE, merge));
        [branchPath, reviewPath, mergePath].forEach((path) => setOpacity(path, fade));

        branchCommits.forEach((commit, index) => {
            const appear = progress(branch, commitShares[index] - 0.04, commitShares[index]);
            setOpacity(commit.g, Math.min(appear, fade));
        });
        setOpacity(branchTag.label, Math.min(progress(branch, 0.2, 0.35), fade));
        setOpacity(branchTag.leader, Math.min(progress(branch, 0.2, 0.35), fade));

        setOpacity(pullRequest.g, Math.min(opened > 0 ? 1 : 0, fade));
        pullRequest.sil.classList.toggle("filled", review >= 1);
        pullRequest.sil.classList.toggle("accent", opened > 0 && review < 1);
        slab(pullRequest, scene, PR_CENTRE, 16, 11, GROUND, lerp(0.6, 6, opened), 3);
        moveTag(
            pullRequestTag,
            scene,
            [PR_CENTRE[0], PR_CENTRE[1], GROUND + lerp(0.6, 6, opened)],
            34,
        );

        const merged = merge >= 1;
        reviewer.sil.classList.toggle("accent", review > 0 && review < 1);
        reviewerTag.label.classList.toggle("on", review > 0 && !merged);
        mergeCommit.sil.classList.toggle("filled", merged && fade > 0.5);

        let text = "";
        if (opened > 0) text = "PR #918 · ready for review";
        if (review >= 1) text = "approved";
        if (merged) text = "merged into main";
        pullRequestTag.label.textContent = text;
        setOpacity(pullRequestTag.label, Math.min(opened, fade));
        setOpacity(pullRequestTag.leader, Math.min(opened, fade));
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
