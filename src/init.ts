import { ASSETS } from "./game_state/assets/state";
import { AGAME } from "./game_state/main/state";
import { GameState } from "./game_state/game_state";
import { getScreenAspect, loadAssets } from "./utils/clear_utils";
import { load3DModels } from "./utils/loaderGlbFiles";
import { cameraSettings } from "./utils/utility";

async function initCore() {
    const { Engine, HavokPlugin, Vector3 } = await import("@babylonjs/core");
    const havok = await import("@babylonjs/havok");
    const physics = await havok.default();
    AGAME.HVK = new HavokPlugin(true, physics);
    AGAME.Canvas = document.querySelector('#app');
    AGAME.Engine = new Engine(AGAME.Canvas, true);
    AGAME.Gravity = new Vector3(0, -9.81, 0);
}


window.addEventListener('load', async () => {
    AGAME.ScreenAspect = getScreenAspect();
    loadAssets(ASSETS.sprites);
    initCore().then(async () => {
        const { sceneOne } = await import("./scenes/scene_one");

        AGAME.Scene = sceneOne(AGAME.Gravity, AGAME.HVK);
        cameraSettings(AGAME.ScreenAspect);
        load3DModels();

        ///---------------------
        GameState.levelRun();
        //----------------------

        AGAME.Engine.runRenderLoop(() => {
            if (!AGAME.RenderLock) {
                AGAME.Scene.render();
            }
        });
    })
});
window.addEventListener('resize', () => {
    AGAME.ScreenAspect = getScreenAspect();
    if (AGAME.Engine) {
        AGAME.Engine.resize();
    }
    if (GameState.camera()) {
        cameraSettings(AGAME.ScreenAspect);
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