import { Engine, HavokPlugin, Scene } from "@babylonjs/core";

export const AGAME = {
    HVK: null as HavokPlugin,
    Canvas: null as HTMLCanvasElement,
    Engine: null as Engine,
    Gravity: null,
    Scene: null as Scene,
    ScreenAspect: null,
    RenderLock: true,
}