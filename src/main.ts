import { Scene, HavokPlugin, Vector3, Engine, Mesh } from "@babylonjs/core"
import inspector, { Inspector } from "@babylonjs/inspector"
import { GameRoot } from "./game_root";

const canvas: HTMLCanvasElement = document.querySelector('#app');
const engine = new Engine(canvas, true);
const gravity = new Vector3(0, -9.81, 0);
const gameRoot = new GameRoot(canvas, engine, gravity);

let scene: Scene = null;

gameRoot.initPhysics().then(() => {

    const physics = gameRoot.physics;
    scene = gameRoot.addScene();

    gameRoot.addCamera()
        .addLight()
        .createGameEnvironment();


    engine.runRenderLoop(() => {
        scene.render();
    });
});
//Inspector Show/HIde event by Key[i]
window.addEventListener("keydown", (ev) => {
    if (ev.key === 'i') {
        if (Inspector.IsVisible) {
            Inspector.Hide();
        } else {
            Inspector.Show(scene, { embedMode: true, });
        }
    }
});
// Resize Event 
window.addEventListener('resize', () => engine.resize());