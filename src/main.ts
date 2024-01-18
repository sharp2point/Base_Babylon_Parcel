import { Scene, HavokPlugin, Vector3, Engine, Mesh, MeshBuilder, TransformNode } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
// import { Inspector } from "@babylonjs/inspector";
import { sceneOne } from "./scenes/scene_one";
import { load3DModels } from "./utils/loaderGlbFiles";
import { GameState } from "./game_state/game_state";

//---------------- GLOBAL VARIABLES ----------------->
globalThis.gameCanvas = document.querySelector('#app');
globalThis.gameEngine = new Engine(globalThis.gameCanvas, true);
globalThis.gameGravity = new Vector3(0, -9.81, 0);
globalThis.HVK = null;
globalThis.gameWorkScene = null;
globalThis.renderLock = false;
globalThis.screenOrient = "portret"
globalThis.screenAspect = null;

//Inspector Show/HIde event by Key[i]
window.addEventListener("keydown", (ev) => {
    if (ev.key === 'i' && ev.altKey) {
        // if (Inspector.IsVisible) {
        //     Inspector.Hide();
        // } else {
        //     Inspector.Show(globalThis.gameWorkScene, { embedMode: true, });
        // }
    }
});
// Resize Event 
window.addEventListener('resize', () => {
    globalThis.gameEngine.resize();
    const viewport_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    globalThis.screenAspect = aspect;
    screen.orientation.type.includes("portrait") ?
        globalThis.screenOrient = "portrait" :
        globalThis.screenOrient = "landscape";
    console.log("Size: w", 160 - ((80 / 1.3) * globalThis.screenAspect))
});

window.addEventListener('load', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    globalThis.screenAspect = aspect;
    console.log("AP: ", globalThis.screenAspect)
    screen.orientation.type.includes("portrait") ?
        globalThis.screenOrient = "portrait" :
        globalThis.screenOrient = "landscape";

    //-----------------------------------------------------------------//
    async function initPhysics() {
        const havokInstance = await HavokPhysics();
        globalThis.HVK = new HavokPlugin(true, havokInstance);
    }
    initPhysics().then(() => {
        GameState.menuCreate();
        const scene = sceneOne(globalThis.gameGravity, globalThis.HVK);
        //------------------------------------------------------------->
        const img = new Image(256, 256);
        img.src = "public/sprites/points10.png";
        img.onload = () => {
            GameState.sprites().set("points10", img);
        }
        //-------------------------------------------------------------->
        load3DModels();
        GameState.signalReaction(); // MENU_OPEN: 10


        globalThis.gameEngine.runRenderLoop(() => {
            if (!globalThis.renderLock) {
                scene.render();
            }
        });
    });
});