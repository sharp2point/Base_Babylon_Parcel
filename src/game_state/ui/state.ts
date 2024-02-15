import { Engine } from "@babylonjs/core";

export const UISTATE = {
    Engine: null,
    Canvas: null,
    Camera: null,
    Scene: null,
    RenderLock: false,
    Scoreboard: {
        timer: null,
        score: null
    },
    view: {
        spotBallDiameter: 5,
    },
}