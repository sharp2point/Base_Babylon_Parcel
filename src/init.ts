import { Engine, HavokPlugin, Vector3 } from "@babylonjs/core";
import { sceneOne } from "./scenes/scene_one";
import { AGAME, GameState } from "./game_state/game_state";
import { load3DModels } from "./utils/loaderGlbFiles";


async function initPhysics(HavokPhysics: any) {
    const physics = await HavokPhysics();
    AGAME.HVK = new HavokPlugin(true, physics);
}
function initGameGlobalsObject() {
    AGAME.Canvas = document.querySelector('#app');
    AGAME.Engine = new Engine(AGAME.Canvas, true);
    AGAME.Gravity = new Vector3(0, -9.81, 0);
}
function getScreenAspect() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    AGAME.ScreenAspect = aspect;
}
function loadAssets() {
    const img = new Image(256, 256);
    img.src = "public/sprites/points10.png";
    img.onload = () => {
        GameState.sprites().set("points10", img);
    }
}

window.addEventListener('load', async () => {
    const physics = await import("@babylonjs/havok");
    const init_screen = document.createElement('init-screen');
    document.body.appendChild(init_screen);
    initPhysics(physics.default).then(() => {
        initGameGlobalsObject();
        getScreenAspect();
        
        const scene = sceneOne(AGAME.Gravity, AGAME.HVK);
        GameState.cameraSettings();
        //GameState.signalReaction();
        loadAssets();
        load3DModels();
        AGAME.Engine.runRenderLoop(() => {
            if (!AGAME.RenderLock) {
                scene.render();
            }
        });
    })
});
window.addEventListener('resize', () => {
    if (AGAME.Engine) {
        AGAME.Engine.resize();
        getScreenAspect();
    }
    if (GameState.camera()) {
        GameState.cameraSettings();
    }
});
window.addEventListener("keydown", (ev) => {
    if (ev.key === 'i' && ev.altKey) {
        // if (Inspector.IsVisible) {
        //     Inspector.Hide();
        // } else {
        //     Inspector.Show(AGAME.Scene, { embedMode: true, });
        // }
    }
});