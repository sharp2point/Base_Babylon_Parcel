export const PROFILESTATE = new Array<number>();
export function loadTime() {
    PROFILESTATE.push(Date.now());
}
export function loadTime2() {
    if (!PROFILESTATE.length) {
        PROFILESTATE.push(Math.round(Date.now() / 1000));
    } else {
        PROFILESTATE.push(Math.round(Date.now() / 1000) - PROFILESTATE[PROFILESTATE.length - 1]);
    }
    return PROFILESTATE[PROFILESTATE.length - 1]
}
export function StatisticTime() {
    console.log("Stat Time: ", PROFILESTATE);
}