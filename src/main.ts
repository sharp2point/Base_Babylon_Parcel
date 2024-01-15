import { Scene, HavokPlugin, Vector3, Engine, Mesh } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { Inspector } from "@babylonjs/inspector";
import { sceneOne } from "./scenes/scene_one";
import { load3DModels } from "./utils/loaderGlbFiles";
import { GameState } from "./game_state/game_state";
//---------------- VARIABLES ----------------->
globalThis.gameCanvas = document.querySelector('#app');
globalThis.gameEngine = new Engine(globalThis.gameCanvas, true);
globalThis.gameGravity = new Vector3(0, -9.81, 0);
globalThis.HVK = null;
globalThis.gameWorkScene = null;
globalThis.renderLock = false;
//-----------------------------------------------------------------//

async function initPhysics() {
    const havokInstance = await HavokPhysics();
    globalThis.HVK = new HavokPlugin(true, havokInstance);
}
initPhysics().then(() => {
    GameState.menuCreate();
    const scene = sceneOne(globalThis.gameGravity, globalThis.HVK);
    GameState.createMap(1);    
    GameState.signalReaction(); // MENU_OPEN: 10
    load3DModels();

    globalThis.gameEngine.runRenderLoop(() => {
        if (!globalThis.renderLock) {
            scene.render();
        }
    });
});
//Inspector Show/HIde event by Key[i]
window.addEventListener("keydown", (ev) => {
    if (ev.key === 'i' && ev.altKey) {
        if (Inspector.IsVisible) {
            Inspector.Hide();
        } else {
            Inspector.Show(globalThis.gameWorkScene, { embedMode: true, });
        }
    }
});
// Resize Event 
window.addEventListener('resize', () => {
    globalThis.gameEngine.resize();
    const viewport_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (viewport_width <= 992) {

    } else {

    }
});