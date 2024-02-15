import { GameState } from "@/game_state/game_state";
import { Color4, Mesh, ParticleSystem, Scene, Texture, Vector3 } from "@babylonjs/core";

export function initGameTimeout() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });
}
export function loadAssets(state: any) {
    const img = new Image(256, 256);
    img.src = "public/sprites/points10.webp";
    img.onload = () => {
        state.set("points10", img);
    }
}
export function getScreenAspect() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return width / height;
}
export function getInnerWindow() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    }
}
export function appendParticles(name: string, mesh: Mesh, options: {
    color1: Color4, color2: Color4, color3: Color4,
    capacity: number, emitRate: number, max_size: number, updateSpeed: number,
    emmitBox: Vector3, lifeTime: number, gravityY: number, isLocal?: boolean,
    sphere?: {
        radius: number, range: number
    }
}, scene: Scene) {
    const prt = new ParticleSystem(name, options.capacity, scene);
    prt.emitter = mesh;
    prt.particleTexture = new Texture("public/sprites/dirt_02.png");
    prt.maxEmitPower = 0.3;
    prt.minEmitPower = 0.1;
    prt.emitRate = options.emitRate;
    prt.color1 = options.color1;
    prt.color2 = options.color2;
    prt.colorDead = options.color3;
    prt.maxLifeTime = options.lifeTime;
    prt.minLifeTime = 0.1;
    prt.minAngularSpeed = 1;
    prt.maxSize = options.max_size;
    prt.minSize = 0.1;
    if (!options.isLocal) {
        prt.maxEmitBox = options.emmitBox;
        prt.minEmitBox = options.emmitBox.multiply(new Vector3(-1, -1, -1));
    }
    prt.updateSpeed = options.updateSpeed;
    prt.direction1 = new Vector3(0, 1, 0);
    prt.direction2 = new Vector3(0, 1, 0);
    prt.gravity = new Vector3(0, options.gravityY, 0);
    prt.disposeOnStop = true;
    prt.isLocal = options.isLocal ?? false;
    if (options.sphere) {
        const hemyPart = prt.createHemisphericEmitter(options.sphere.radius, options.sphere.range);
    }

    return prt;
}

export function getTypeUserDevice() {
    // console.log("---- USER DEVICE ----")
    // console.log(window.navigator);
    // console.log(window.navigator.maxTouchPoints);
    console.log(window.navigator.language)
    // if (window.navigator.userAgentData) {
    //     console.log(window.navigator.userAgentData.platform)
    //     console.log(window.navigator.userAgentData.mobile)
    // }
    GameState.state.lang = window.navigator.language
    // console.log(navigator.userAgent);
    // console.log("---- USER DEVICE ----")
}