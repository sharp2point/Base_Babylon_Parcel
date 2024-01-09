import { Scene, HavokPlugin, Vector3, Engine, Mesh } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { Inspector } from "@babylonjs/inspector";
import { sceneOne } from "./scenes/scene_one";
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
    globalThis.gameWorkScene = sceneOne(globalThis.gameGravity, globalThis.HVK);
    globalThis.gameEngine.runRenderLoop(() => {
        if (!globalThis.renderLock) {
            globalThis.gameWorkScene.render();
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
window.addEventListener('resize', () => globalThis.gameEngine.resize());