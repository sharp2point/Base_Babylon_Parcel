import { Engine, HavokPlugin, HighlightLayer, Vector3 } from "@babylonjs/core";
import * as havok from "@babylonjs/havok";
import { Inspector } from "@babylonjs/inspector";
import { ASSETS } from "./game_state/assets/state";
import { AGAME } from "./game_state/main/state";
import { GameState } from "./game_state/game_state";
import { UISTATE } from "./game_state/ui/state";
import { getScreenAspect, getTypeUserDevice, loadAssets } from "./utils/clear_utils";
import { loadBombEffectModel, loadBuildModel, loadDamageEnemyModel, loadEnemyModel, loadRocketEffectModel } from "./utils/loaderGlbFiles";
import { cameraSettings, initMaterials, initModels } from "./utils/utility";
import { openIndexDB } from "./DB/indexdb";

async function initCore() {
    const physics = await havok.default();
    AGAME.HVK = new HavokPlugin(true, physics);
    AGAME.Canvas = document.querySelector('#app');
    AGAME.Engine = new Engine(AGAME.Canvas, true, { xrCompatible: false }, true);
    AGAME.Gravity = new Vector3(0, -9.81, 0);
    UISTATE.Canvas = AGAME.Canvas;
    UISTATE.Engine = AGAME.Engine;
}

window.addEventListener('load', async () => {
    getTypeUserDevice()
    AGAME.ScreenAspect = getScreenAspect();
    loadAssets(ASSETS.sprites);
    AGAME.RenderLock = true;
    UISTATE.RenderLock = false;

    initCore().then(async () => {
        const { UIScene } = await import("./ui/ui");
        const { sceneOne } = await import("./scenes/scene_one");

        sceneOne(AGAME.Gravity, AGAME.HVK);
        cameraSettings(AGAME.ScreenAspect);
        UIScene();

        Promise.all(
            [
                loadEnemyModel(AGAME.Scene),
                loadBuildModel(AGAME.Scene),
                loadDamageEnemyModel(AGAME.Scene),
                loadBombEffectModel(AGAME.Scene),
                loadRocketEffectModel(AGAME.Scene),
            ]
        ).then((res) => {
            console.log("Loading Models: ", res);
            initModels(AGAME.Scene);
        }).catch((err) => {
            console.log("Error Models: ", err);
        })
        initMaterials(AGAME.Scene);
        //-------------------------------------->
        openIndexDB();
        //--------------------------------------->

        AGAME.Engine.runRenderLoop(() => {
            if (!AGAME.RenderLock && UISTATE.RenderLock) {
                AGAME.Scene.render();
            } else if (!UISTATE.RenderLock && AGAME.RenderLock) {
                UISTATE.Scene.render();
            }
        });
    });
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
        if (Inspector.IsVisible) {
            Inspector.Hide();
        } else {
            Inspector.Show(AGAME.Scene, { embedMode: true, });
        }
    }
});