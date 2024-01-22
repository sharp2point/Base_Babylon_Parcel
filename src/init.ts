import { AGAME, GameState } from "./game_state/game_state";
import { initPIXI } from "./pixi/pixi_ui";
import { load3DModels } from "./utils/loaderGlbFiles";

async function initCore() {
    const { Engine, HavokPlugin, Vector3 } = await import("@babylonjs/core");
    const havok = await import("@babylonjs/havok");
    const physics = await havok.default();
    AGAME.HVK = new HavokPlugin(true, physics);
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
    img.src = "public/sprites/points10.webp";
    img.onload = () => {
        GameState.sprites().set("points10", img);
    }
}

function initGameTimeout() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 4000);
    });
}

window.addEventListener('load', async () => {
    getScreenAspect();
    GameState.loadHtmlUI();
    await initGameTimeout();
    initCore().then(async () => {
        loadAssets();
        const { sceneOne } = await import("./scenes/scene_one");
        AGAME.Scene = sceneOne(AGAME.Gravity, AGAME.HVK);
        GameState.cameraSettings();
        load3DModels();
        GameState.hidePreLoader();
        //-------------------------------------->
        //GameState.drawCanvas();
        initPIXI();
        //--------------------------------------->

        AGAME.Engine.runRenderLoop(() => {
            if (!AGAME.RenderLock) {
                AGAME.Scene.render();
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