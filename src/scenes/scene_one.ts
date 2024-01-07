import { Color3, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, UniversalCamera, Vector3 } from "@babylonjs/core";

export function sceneOne() {
    const scene = new Scene(globalThis.gameEngine);
    const camera = new UniversalCamera("main-scene-camera", new Vector3(0, 15, -15), scene);
    camera.target = Vector3.Zero();
    const light = new HemisphericLight("main-scene-hemilight", Vector3.Zero(), scene);
    light.diffuse = new Color3(0.8, 0.8, 0.8);
    light.intensity = 1;
    //------------------------------------------------
    const cube = MeshBuilder.CreateBox("cube", { size: 3 });
    const cube_material = new StandardMaterial("cube-material", scene);
    cube_material.diffuseTexture = new Color3(0.5, 0.4, 0.05);
    cube.material = cube_material;
    //-------------------------------------------------

    return scene;
}