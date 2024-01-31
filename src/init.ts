import { Engine, HavokPlugin, Vector3 } from "@babylonjs/core";
import * as havok from "@babylonjs/havok";
import { Inspector } from "@babylonjs/inspector";
import { ASSETS } from "./game_state/assets/state";
import { AGAME } from "./game_state/main/state";
import { GameState } from "./game_state/game_state";
import { UISTATE } from "./game_state/ui/state";
import { getScreenAspect, loadAssets } from "./utils/clear_utils";
import { loadDamageEnemyModel } from "./utils/loaderGlbFiles";
import { cameraSettings } from "./utils/utility";

async function initCore() {
    const physics = await havok.default();
    AGAME.HVK = new HavokPlugin(true, physics);
    AGAME.Canvas = document.querySelector('#app');
    AGAME.Engine = new Engine(AGAME.Canvas, true, { xrCompatible: false }, true);
    AGAME.Gravity = new Vector3(0, -9.81, 0);
}
async function initUI() {
    const place = document.querySelector("#ui-place") as HTMLElement;
    const ui_canvas = document.createElement("canvas") as HTMLCanvasElement;
    ui_canvas.setAttribute("id", "ui-canvas");
    place.appendChild(ui_canvas);
    UISTATE.Canvas = document.querySelector('#ui-canvas');
    UISTATE.Engine = new Engine(UISTATE.Canvas, true, { xrCompatible: false }, true);  
}

window.addEventListener('load', async () => {
    AGAME.ScreenAspect = getScreenAspect();
    loadAssets(ASSETS.sprites);

    AGAME.RenderLock = true;
    UISTATE.RenderLock = false;

    initUI().then(async () => {
        const { UIScene } = await import("./ui/ui");
        UISTATE.Scene = UIScene();
        UISTATE.Engine.runRenderLoop(() => {
            if (!UISTATE.RenderLock) {
                UISTATE.Scene.render();
            }
        })

    });
    initCore().then(async () => {
        const { sceneOne } = await import("./scenes/scene_one");
        AGAME.Scene = sceneOne(AGAME.Gravity, AGAME.HVK);
        cameraSettings(AGAME.ScreenAspect);
        loadDamageEnemyModel(AGAME.Scene);

        //-------------------------------------->
        //endUIPreloader();
        //--------------------------------------->

        AGAME.Engine.runRenderLoop(() => {
            if (!AGAME.RenderLock) {
                AGAME.Scene.render();
            }
        });
    });
});
window.addEventListener('resize', () => {
    AGAME.ScreenAspect = getScreenAspect();
    if (AGAME.Engine) {
        AGAME.Engine.resize();
        UISTATE.Engine.resize();
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