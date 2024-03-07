import { Engine } from "@babylonjs/core";
import * as PIXI from "pixi.js";

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
    PIXI: null as PIXI.Application<PIXI.Renderer>,
    UI: new Map<string, HTMLElement>(),
}