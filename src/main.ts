import { Scene, HavokPlugin, Vector3, Engine } from "@babylonjs/core"
//import inspector from "@babylonjs/inspector"
import { GameRoot } from "./game_root";

const canvas: HTMLCanvasElement = document.querySelector('#app');
const engine = new Engine(canvas, true);
const gravity = new Vector3(0, -9.81, 0);
const gameRoot = new GameRoot(canvas, engine, gravity);
let scene: Scene = null;

gameRoot.initPhysics().then(() => {
    const physics = gameRoot.physics;
    scene = gameRoot.addScene();

    gameRoot.addCamera().addLight().addEventHandlers();
    gameRoot.loadModel("public/models/", "Ball.glb").then(() => {
        const ball = gameRoot.instateMesh("Ball");
        ball.scaling = new Vector3(0.3, 0.3, 0.3);
        ball.position = new Vector3(0, 0, 0);

        const ball2 = gameRoot.instateMesh("Ball2");
        ball2.scaling = new Vector3(0.3, 0.3, 0.3);
        ball2.position = new Vector3(-2, 0, 0);

        const ball3 = gameRoot.instateMesh("Ball3");
        ball3.scaling = new Vector3(0.3, 0.3, 0.3);
        ball3.position = new Vector3(2, 0, 0);
    })


    engine.runRenderLoop(() => {
        scene.render();
    });
});
window.addEventListener("keydown", (ev) => {
    if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'i') {
        if (scene.debugLayer.isVisible()) {
            scene.debugLayer.hide();
        } else {
            scene.debugLayer.show();
        }
    }
});
window.addEventListener('resize', () => engine.resize());