import { UISTATE } from "@/game_state/ui/state";
import { getInnerWindow } from "@/utils/clear_utils";
import {
    AssetContainer,
    Color3, Color4, HemisphericLight, MeshBuilder,
    Scene, SpotLight, StandardMaterial,
    Texture, Mesh,
    Tools, TransformNode, UniversalCamera, Vector3,
    Material
} from "@babylonjs/core";
import { removePreloader } from "./html/ui_components";
import { spinMenu } from "./spin2";
import { initTeach } from "@/teach/teach";
import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";

export function UIScene() {
    const scene = new Scene(UISTATE.Engine);
    scene.clearColor = new Color4(1, 1, 1, 0);
    scene.ambientColor = new Color3(1, 1, 1);

    const camera = new UniversalCamera("ui-camera", new Vector3(0, 18, 15), scene);
    camera.fov = Tools.ToRadians(70);
    camera.target = new Vector3(0, 0, 0);
    UISTATE.Camera = camera;

    const spot = new SpotLight("spot-1", new Vector3(0, 30, 0), new Vector3(0, -1, 0), Tools.ToRadians(50), 30, scene);
    spot.diffuse = new Color3(1, 1, 1);
    spot.specular = new Color3(1, 1, 1);
    spot.intensity = 0.9;



    sceneBuilder(scene);

    scene.onReadyObservable.addOnce(() => {
        onReady(scene);
    });

    UISTATE.Scene = scene;
}
//------------------------------------------------------>
function onReady(scene: Scene) {
    removePreloader().then(() => {
        spinMenu(scene);

        const materiala = new StandardMaterial("arcanoid-mt", UISTATE.Scene);
        materiala.diffuseColor = new Color3(0.9, 0.9, 0.9);
        materiala.diffuseTexture = new Texture("public/images/t_ru/t_dif.webp");
        materiala.bumpTexture = new Texture("public/images/t_ru/t_n.webp");
        materiala.specularColor = new Color3(0.7, 0.7, 0.6);
        materiala.ambientColor = new Color3(0.01, 0.02, 0.1);
        materiala.specularPower = 1;

        const materialh = new StandardMaterial("header-mt", UISTATE.Scene);
        materialh.diffuseColor = new Color3(0.3, 0.2, 0.2);       
        materialh.diffuseTexture = new Texture("public/images/t_ru/t_dif.webp");
        materialh.bumpTexture = new Texture("public/images/t_ru/t_n.webp");
        materialh.specularPower = 0;

        const tnh = loadHeaderParts("header", materialh, { scale: 2.3, position: new Vector3(0, 10, 0), rotateX: 50 });
        const tna = loadHeaderParts("arcanoid", materiala, { scale: 1, position: new Vector3(0, 10, 2), rotateX: 50 });

        const light = new HemisphericLight("ui-light", new Vector3(0, 10, 10), UISTATE.Scene);
        light.diffuse = new Color3(1, 1, 1);
        light.specular = new Color3(0, 0, 0);
        light.intensityMode = 1;
        light.intensity = 0.5;
        light.includedOnlyMeshes = [...tnh.getChildMeshes(), ...tna.getChildMeshes()];
        //initTeach(document.querySelector("#teach-place"));
    });
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
function loadHeaderParts(assetName: string, material: StandardMaterial, options: { scale: number, position: Vector3, rotateX: number }) {
    const tn = new TransformNode(assetName, UISTATE.Scene);
    const asset = ASSETS.containers3D.get(assetName) as AssetContainer;
    const inst = asset.instantiateModelsToScene((name) => name);

    const models = inst.rootNodes[0].getChildMeshes();

    const langSelector = (lang: string, m: Mesh) => {
        if (m.name.includes(lang)) {
            const letter = m.clone(m.name, tn);
            letter.material = material;
        }
    }

    models.forEach(m => {
        if (GameState.lang() === 'ru') {
            langSelector('ru', m as Mesh);
            if (m.name.includes("t")) {
                console.log(m.name);
                // const material = new StandardMaterial("fort", UISTATE.Scene);
                // material.diffuseColor = new Color3(1, 0, 0);
                // material.diffuseTexture = new Texture("public/images/t_ru/t_dif.png");
                // material.bumpTexture = new Texture("public/images/t_ru/t_n.png");
                // m.material = material;
            }
        } else if (GameState.lang() === 'en') {
            langSelector('en', m as Mesh);
        }
    });
    inst.dispose();

    tn.scalingDeterminant = options.scale;
    tn.position = options.position;
    tn.rotation.z = Tools.ToRadians(180);
    tn.rotation.x = Tools.ToRadians(options.rotateX);
    tn.scaling.z = 1.0;
    return tn;
}