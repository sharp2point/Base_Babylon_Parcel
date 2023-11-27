import { HavokPlugin, Scene, Engine, KeyboardEventTypes, FreeCamera, HemisphericLight, Vector3, AssetContainer } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { loadToAssetContainer, mergeMeshes } from "./loaderGlbFiles";


export class GameRoot {

    #canvas: HTMLCanvasElement = null;
    #scene: Scene = null;
    #engine: Engine = null;
    #gravity: Vector3 = null
    #physics: HavokPlugin = null;
    #assetContainer: AssetContainer = null;

    constructor(canvas: HTMLCanvasElement, engine: Engine, gravity: Vector3) {
        this.#canvas = canvas;
        this.#engine = engine;
        this.#gravity = gravity;
    }
    get physics() {
        return this.#physics;
    }
    get scene() {
        return this.#scene;
    }

    initPhysics = async () => {
        const havokInstance = await HavokPhysics();
        this.#physics = new HavokPlugin(true, havokInstance);
    }
    addScene = () => {
        const scene = new Scene(this.#engine)
        scene.enablePhysics(this.#gravity, this.#physics);
        this.#scene = scene;
        return this.scene;
    }
    addCamera = () => {
        let camera = new FreeCamera("camera", new Vector3(0, 5, -10), this.#scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(this.#canvas, true);
        return this;
    }
    addLight = () => {
        let light = new HemisphericLight("light", new Vector3(0, 1, 0), this.#scene);
        light.intensity = 0.7;
        return this;
    }
    addEventHandlers = () => {
        this.#scene.onKeyboardObservable.add((kbinf) => {
            switch (kbinf.type) {
                case KeyboardEventTypes.KEYDOWN:
                    switch (kbinf.event.key.toLowerCase()) {
                        case "a": {
                            console.log("Press A");
                            break;
                        }
                        case "d": {
                            console.log("Press D");
                            break;
                        }
                        case "w": {
                            console.log("Press W");
                            break;
                        }
                        case "s": {
                            console.log("Press S");
                            break;
                        }
                    }
            }
        });
        return this;
    }
    createGameEnvironment = () => {

    }
    loadModel = async (rootPath: string, fileName: string) => {
        this.#assetContainer = await loadToAssetContainer(rootPath, fileName, this.#scene);
        return this;
    }
    instateMesh = (nameMesh: string) => {
        const instanceModel = this.#assetContainer.instantiateModelsToScene(() => nameMesh, true)
        const mesh = mergeMeshes(instanceModel);
        return mesh;
    }
}