import {
    HavokPlugin, Scene, Engine,
    KeyboardEventTypes, FreeCamera,
    HemisphericLight, Vector3,
    AssetContainer, Mesh, MeshBuilder,
    Material, StandardMaterial,
    Color3, Color4, Texture, ActionManager,
    ExecuteCodeAction, PhysicsBody, PhysicsMotionType,
    PhysicsShapeConvexHull, PhysicsShapeBox, Quaternion,
    PhysicsShapeSphere, Vector2, EasingFunction, DistanceConstraint, BallAndSocketConstraint, Tools,

} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";

import { createGround, createStar, createStarBox } from "./game_objects";
import { randomInt } from "./utility";
import { SizeBox, StarId, FlySide } from "./game_in_types";
import { instateMesh, loadModel } from "./loaderGlbFiles";


export class GameRoot {

    _canvas: HTMLCanvasElement = null;
    _scene: Scene = null;
    _engine: Engine = null;
    _gravity: Vector3 = null
    _physics: HavokPlugin = null;

    gameEnvSize = new Vector2(50, 50);

    constructor(canvas: HTMLCanvasElement, engine: Engine, gravity: Vector3) {
        this._canvas = canvas;
        this._engine = engine;
        this._gravity = gravity;
    }
    get physics() {
        return this._physics;
    }
    get scene() {
        return this._scene;
    }

    initPhysics = async () => {
        const havokInstance = await HavokPhysics();
        this._physics = new HavokPlugin(true, havokInstance);
    }
    addScene = () => {
        const scene = new Scene(this._engine)
        scene.enablePhysics(this._gravity, this.physics);
        scene.clearColor = new Color4(0.1, 0.1, 0.2, 1);
        scene.ambientColor = new Color3(0.01, 0.01, 0.01);
        this._scene = scene;

        return this.scene;
    }
    addCamera = () => {
        let camera = new FreeCamera("camera", new Vector3(0, 8, -15), this.scene);
        camera.setTarget(Vector3.Zero());

        camera.attachControl(this._canvas, true);
        return this;
    }
    addLight = () => {
        let light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;
        return this;
    }
    addDefaultEnvironment = () => {
        // this.#scene.createDefaultCameraOrLight(true, true, true);
        this.scene.createDefaultEnvironment();
        return this;
    }
    addActionManager = (inputMap: {}) => {

        this.scene.actionManager = new ActionManager(this.scene);
        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (e) => {
            inputMap[e.sourceEvent.key] = e.sourceEvent.type === "keydown";
            if (e.sourceEvent.type === "keydown" && (e.sourceEvent.key === "c" || e.sourceEvent.key === "z")) {
                console.log("JUMP TRUE")
            }
        }));
        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (e) => {
            inputMap[e.sourceEvent.key] = e.sourceEvent.type === "keydown";
            if (e.sourceEvent.type === "keyup" && (e.sourceEvent.key === "c" || e.sourceEvent.key === "z")) {
                console.log("JUMP FALSE")
            }
        }));
    }
    addEventHandlers = () => {
        this.scene.onKeyboardObservable.add((kbinf) => {
            if (kbinf.type === KeyboardEventTypes.KEYDOWN) {
                const eventKey = kbinf.event.key.toLowerCase();
                if (eventKey === "a") {
                };
                if (eventKey === "d") {
                };
                if (eventKey === "w") {
                };
                if (eventKey === "s") {
                };
            }
        }
        );
        return this;
    }
    // GAME LOGIC DEVELOP
    createGameEnvironment = async () => {
        // GAME LOGIC DEVELOP
        let inputMap = {};
        const starSizeBox: SizeBox = {
            width: 50,
            height: 25,
            dept: 50
        }
        this.addActionManager(inputMap);

        createGround(this.scene, this.gameEnvSize);
        const starBox = createStarBox(this.scene, starSizeBox);
        const star = createStar({ name: "star", id: 1 }, 0.5, this.scene);
        star.isVisible = false;
        const starArray = [];
        for (let i = 0; i < 300; i++) {
            const new_star = star.createInstance(`star-${i}`);
            const x = randomInt(-starSizeBox.width / 2, starSizeBox.width / 2);
            const y = randomInt(5, starSizeBox.height);
            const z = randomInt(-starSizeBox.dept / 2, starSizeBox.dept / 2);
            new_star.position = new Vector3(x, y, z);
            const scale = 1 / randomInt(5, 20);
            new_star.scaling = new Vector3(scale, scale, scale);
            starArray.push(new_star);
            new_star.parent = starBox;
        }

        const container = await loadModel("public/models/", "bat.glb", this.scene);
        const bat = instateMesh("Bat", container as AssetContainer);
        bat.position = new Vector3(0, 2, 0);

        const camera = this.scene.activeCamera as FreeCamera;

        //------ Rendering -----------------//
        this.scene.onBeforeRenderObservable.add(() => {
            if (inputMap["w"]) {
                bat.position.y += 0.1
                camera.position.y += 0.1;
            }
            if (inputMap["s"]) {
                bat.position.y -= 0.1
                camera.position.y -= 0.1;
            }
            if (inputMap["a"]) {
                
                bat.rotation.z = 0.2
                bat.position.x -= 0.1
                camera.position.x -= 0.1;
            }

            if (inputMap["d"]) {
                bat.rotation.z = -0.2
                bat.position.x += 0.1
                camera.position.x += 0.1;
            }
        });
    }

}