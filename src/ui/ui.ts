import { UISTATE } from "@/game_state/ui/state";
import { getInnerWindow } from "@/utils/clear_utils";
import {Color3, Color4, HemisphericLight, MeshBuilder,
    Scene, SpotLight, StandardMaterial,
    Tools, UniversalCamera, Vector3
} from "@babylonjs/core";
import { backSetOpaq_0 } from "./html/ui_components";
import { spinMenu2 } from "./spin2";

export function UIScene() {
    const scene = new Scene(UISTATE.Engine);
    scene.clearColor = new Color4(1, 1, 1, 0);
    scene.ambientColor = new Color3(1, 1, 1);

    const camera = new UniversalCamera("ui-camera", new Vector3(0, 18, 15), scene);
    camera.fov = Tools.ToRadians(70);
    camera.target = new Vector3(0, 0, 0);
    UISTATE.Camera = camera;

    const light = new HemisphericLight("ui-light", new Vector3(0, 1, 0), scene);
    light.diffuse = new Color3(0.5, 0.5, 0.5);
    light.specular = new Color3(0, 0, 0);
    light.intensity = 0.0;

    const spot = new SpotLight("spot-1", new Vector3(0, 30, 0), new Vector3(0, -1, 0), Tools.ToRadians(50), 30, scene);
    spot.diffuse = new Color3(1, 1, 1);
    spot.specular = new Color3(1, 1, 1);
    spot.intensity = 0.9;

    sceneBuilder(scene);

    scene.onReadyObservable.add(() => {
        onReady(scene);
    });
    
    UISTATE.Scene = scene;
}
//------------------------------------------------------>
function onReady(scene: Scene) {
    backSetOpaq_0();
    spinMenu2(scene);
}
function sceneBuilder(scene: Scene) {
    const window_size = getInnerWindow();
    const ground = MeshBuilder.CreateGround("ground", { width: window_size.width, height: window_size.height }, scene);
    ground.receiveShadows = true;
    const material = new StandardMaterial("ground-mt", scene);
    material.diffuseColor = new Color3(0.1, 0.1, 0.3);
    material.maxSimultaneousLights = 10;
    ground.material = material;
}