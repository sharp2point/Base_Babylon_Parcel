import { ASSETS } from "@/game_state/assets/state";
import { UISTATE } from "@/game_state/ui/state";
import { getInnerWindow } from "@/utils/clear_utils";
import {
    Animation, AssetContainer, Axis, CircleEase, Color3, Color4, DirectionalLight, EasingFunction, GlowLayer, HemisphericLight, HighlightLayer, Light, Mesh, MeshBuilder, NoiseProceduralTexture, PBRMaterial, ParticleSystem, Scalar, Scene, ShadowGenerator, ShadowLight, SineEase, Space, SpotLight,
    StandardMaterial, Texture, Tools, TransformNode, UniversalCamera, ValueCondition, Vector3
} from "@babylonjs/core";
import { backSetOpaq_0 } from "./html/ui_components";
import { loadShieldYarModel, loadShieldYarPartModel } from "@/utils/loaderGlbFiles";

export function UIScene() {
    const window_size = getInnerWindow();
    const scene = new Scene(UISTATE.Engine);
    scene.clearColor = new Color4(1, 1, 1, 0);
    scene.ambientColor = new Color3(1, 1, 1);

    const camera = new UniversalCamera("ui-camera", new Vector3(0, 30, 0), scene);
    camera.fov = Tools.ToRadians(70);
    camera.target = new Vector3(0, 0, 0);
    UISTATE.Camera = camera;

    // const light = new HemisphericLight("ui-light", new Vector3(0, 1, 0), scene);
    // light.diffuse = new Color3(0.1, 0.1, 0.1);
    // light.specular = new Color3(0, 0, 0);
    // light.intensity = 0.5;

    const dirLight = new DirectionalLight("dir-light", new Vector3(0, -1, -2), scene);
    dirLight.diffuse = new Color3(0.9, 0.7, 0.7);
    dirLight.specular = new Color3(0, 0, 0);
    dirLight.intensity = 0.7;
    dirLight.shadowEnabled = true;

    const spot2 = new SpotLight("shield-yar-spot", new Vector3(0, 25, -20), new Vector3(0, -1, 0), Tools.ToRadians(60), 40, scene);
    spot2.diffuse = new Color3(1, 1, 1);
    spot2.specular = new Color3(0, 0, 0);
    spot2.intensity = 5;
    spot2.shadowEnabled = true;

    const spot = new SpotLight("spot-1", new Vector3(0, 20, 0), new Vector3(0, -1, 0), Tools.ToRadians(120), 10, scene);
    spot.diffuse = new Color3(0.4, 0.3, 1);
    spot.specular = new Color3(0.7, 0.7, 0.5);
    spot.intensity = 1;
    spot.shadowEnabled = true;

    sceneBuilder(scene);
    hero(scene);
    loader(scene);
    loadShieldYarModel(scene).then(() => {
        const meshes = shieldYarModel(new Vector3(0, 12, -8), scene);
    });

    const menuNode = rotationZMenu(new Vector3(0, 0, 0), camera, scene);
    addAnimationMenu(menuNode, scene);
    scene.beginAnimation(menuNode, 0, 120, true, 0.1);

    scene.onReadyObservable.add(() => {
        backSetOpaq_0();
        shield(new Vector3(0, 1, -12), scene);
    })
    return scene;
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
function loader(scene: Scene) {
    const tn = new TransformNode('loader-tn', scene);

    const ball = ballLoader(scene, new Color3(1, 0.3, 0.1), new Vector3(-5, 0, 0));
    ball.setParent(tn);
    const spot = spotBall(scene, new Color3(0.9, 0.5, 0.2), new Color3(0.6, 0.2, 0.25), new Vector3(-3, 10, 0));
    spot.parent = ball;
    const particle = particleBall(scene, ball, new Color4(0.9, 0.1, 0.1, 0.5), new Color4(0.9, 0.5, 0.1, 0.7));
    particle.start();

    const ball2 = ballLoader(scene, new Color3(0.1, 0.1, 1), new Vector3(5, 0, 0));
    ball2.setParent(tn);
    const spot2 = spotBall(scene, new Color3(0.2, 0.5, 0.9), new Color3(0.25, 0.2, 0.6), new Vector3(3, 10, 0));
    spot2.parent = ball2;
    const particle2 = particleBall(scene, ball2, new Color4(0.1, 0.1, 0.9, 0.5), new Color4(0.1, 0.5, 0.9, 0.7));
    particle2.start();

    tn.position.y = 6;

    const keys = [
        {
            frame: 0,
            value: 0
        },
        {
            frame: 120,
            value: Tools.ToRadians(359)
        }
    ];
    const anim = new Animation("ball-anim", "rotation.y", 20, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE, true);
    anim.setKeys(keys);
    tn.animations.push(anim);

    scene.beginAnimation(tn, 0, 120, true, 1);
}
function ballLoader(scene: Scene, diffuse: Color3, position: Vector3): Mesh {
    const ball = MeshBuilder.CreateSphere('loader-ball', { diameter: 1 }, scene);
    const material = new StandardMaterial("ball-mt", scene);
    material.diffuseColor = diffuse;
    material.emissiveColor = diffuse;
    material.alpha = 0.4;
    ball.material = material;
    ball.position.x = position.x;
    return ball;
}
function spotBall(scene: Scene, diffuse: Color3, specular: Color3, position: Vector3) {
    const spot = new SpotLight("spot-ball2", position, new Vector3(0, -1, 0), Tools.ToRadians(80), 10, scene);
    spot.diffuse = diffuse;
    spot.specular = specular;
    spot.intensity = 0.7;
    return spot;
}
function particleBall(scene: Scene, ball: Mesh, color1: Color4, color2: Color4) {
    const prt = new ParticleSystem("ball-particle", 1000, scene);
    prt.emitter = ball;
    prt.particleTexture = new Texture("public/sprites/dirt_02.png");
    prt.maxEmitPower = 1;
    prt.minEmitPower = 0.1;
    prt.emitRate = 300;
    prt.color1 = color1;
    prt.color2 = color2;
    prt.colorDead = new Color4(0.1, 0.1, 0.1, 0.5);
    prt.maxLifeTime = 2.5;
    prt.minLifeTime = 0.01;
    prt.minAngularSpeed = 1000;
    prt.maxSize = 0.9;
    prt.minSize = 0.01;
    prt.maxEmitBox = new Vector3(0.3, 0.0, 0.3);
    prt.minEmitBox = new Vector3(-0.3, -0.0, -0.3);
    prt.updateSpeed = 0.02;
    prt.direction1 = new Vector3(0, 0, 0);
    prt.direction2 = new Vector3(0, 0, 0);
    prt.gravity = new Vector3(0, 0, 0);
    //prt.isLocal = true;
    prt.disposeOnStop = true;
    return prt;
}
function hero(scene: Scene) {
    const tn = new TransformNode("hero-tn", scene);
    const hero = MeshBuilder.CreateSphere("hero", { diameter: 4.5, updatable: true }, scene);
    hero.setParent(tn);

    hero.rotation.x = Tools.ToRadians(-45);
    hero.rotation.y = Tools.ToRadians(45);
    tn.position.y = 5;

    const material = new StandardMaterial("hero-mat", scene);
    material.diffuseTexture = new Texture("public/hero/lava_d.jpg");
    material.bumpTexture = new Texture("public/hero/lava_n.jpg");
    material.ambientTexture = new Texture("public/hero/lava_o.jpg");
    material.specularTexture = new Texture("public/hero/lava_s.jpg");
    material.maxSimultaneousLights = 10;
    hero.material = material;

    const keys = [
        {
            frame: 0,
            value: 0
        }, {
            frame: 120,
            value: Tools.ToRadians(359)
        }
    ];
    const anim = new Animation("hero-anim", "rotation.z", 10, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE, true);
    anim.setKeys(keys);
    tn.animations.push(anim);

    scene.beginAnimation(tn, 0, 120, true, 1);

    return hero;
}
function shield(position: Vector3, scene: Scene) {
    const tn = new TransformNode("shield-tn", scene);
    const plane = MeshBuilder.CreatePlane("shield-palne", { width: 10, height: 8 }, scene);
    plane.receiveShadows = true;

    //plane.showBoundingBox = true;
    plane.setParent(tn);
    const txt = new Texture("public/sprites/shield.webp", scene);
    txt.hasAlpha = true;
    const material = new StandardMaterial("shield-mt", scene);
    material.diffuseTexture = txt;
    //material.emissiveTexture = txt;
    material.alpha = 0.5;
    material.opacityTexture = txt;
    material.maxSimultaneousLights = 10;

    plane.material = material;
    tn.rotation.y = Tools.ToRadians(180);
    tn.rotation.x = Tools.ToRadians(90);
    tn.position = position;
    tn.scaling = new Vector3(3, 3, 3);
}
function shieldYarModel(position: Vector3, scene: Scene) {
    const tn = new TransformNode("shield-yar-tn", scene);

    const inst = ASSETS.containers3D.get("shield_yar") as AssetContainer;
    const inst_model = inst.instantiateModelsToScene((name) => {
        return `${name}-shield`;
    }, true);

    const childs = inst_model.rootNodes[0].getChildMeshes();
    childs.forEach(m => {
        m.receiveShadows = true;
        m.setParent(tn);
    })

    tn.position = position;
    tn.rotation.x = Tools.ToRadians(20);
    tn.scaling = new Vector3(1, 1, 1);
    return childs;
}
function rotationZMenu(position: Vector3, camera: UniversalCamera, scene: Scene) {
    const tn = new TransformNode("menuZ-tn", scene);
    const item = MeshBuilder.CreateBox("menu-item", { width: 0.25, height: 4, depth: 4, updatable: true }, scene);
    item.isVisible = false;
    item.isEnabled(false);

    const item_counts = 12;
    const angle = Tools.ToRadians(360 / item_counts);
    const menu_radius = 10;

    for (let i = 0; i < item_counts; i++) {
        const posX = position.x + Math.cos(angle * i) * menu_radius;
        const posY = position.y + Math.sin(angle * i) * menu_radius;
        const itm = item.clone(`menu-item-${i}`, null, true, false);
        itm.rotation.z = Tools.ToRadians(i * 360 / item_counts)
        itm.position = new Vector3(posX,  posY,position.z);
        itm.isVisible = true;
        itm.isEnabled(true);
        itm.setParent(tn);
        // itm.onBeforeRenderObservable.add(() => {
        //     // const cam_subs = (camera.position).subtract(itm.position);
        //     // const cam_cross = Vector3.Cross(camera.position, cam_subs);
        //     // const cross_axis = Vector3.Cross(cam_cross, cam_subs);
        //     // itm.rotation = Vector3.RotationFromAxis(cam_subs, cross_axis, cam_cross);
        //     itm.lookAt(camera.position, 0, 0, 0);
        // })
    }
    tn.position = position.add(new Vector3(0, 5, 0));
    return tn;
}
function addAnimationMenu(tnode: TransformNode, scene: Scene) {
    const keys = [
        { frame: 0, value: 0 },
        { frame: 120, value: Tools.ToRadians(359) },
    ];
    const anim = new Animation(`${tnode.name}-anim`, "rotation.z", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    anim.setKeys(keys);
    tnode.animations.push(anim);
}
//----------------------------------------------------------------->
// function shieldYarPrtModel(position: Vector3, scene: Scene) {
//     const tn = new TransformNode("shield-yar_prt-tn", scene);

//     const inst = ASSETS.containers3D.get("shield_yar_prt") as AssetContainer;
//     const inst_model = inst.instantiateModelsToScene((name) => {
//         return `${name}-shield_prt`;
//     }, true);

//     const childs = inst_model.rootNodes[0].getChildMeshes();
//     childs.forEach(m => {
//         m.receiveShadows = true;
//         m.setParent(tn);
//     })

//     tn.position = position;
//     tn.rotation.x = Tools.ToRadians(20);
//     tn.scaling = new Vector3(1, 1, 1);
//     return childs;
// }
// function addAnimationPrt(meshes: Array<Mesh>, scene: Scene) {
//     meshes.forEach(m => {
//         const positionStart = m.position.clone();
//         const positionEnd = positionStart.add(new Vector3(Scalar.RandomRange(-20, 20), 30, Scalar.RandomRange(-20, 20)));
//         // const positionEnd = positionStart.add(new Vector3(3, 3, 3));
//         const keys = [
//             { frame: 0, value: positionEnd },
//             { frame: 120, value: positionStart },
//         ];
//         const anim = new Animation(`${m.name}-anim`, "position", 60, Animation.ANIMATIONTYPE_VECTOR2, Animation.ANIMATIONLOOPMODE_CONSTANT);
//         anim.setKeys(keys);
//         m.animations.push(anim);
//     });
//     return meshes;
// }
// function playPrtAnimation(meshes: Array<Mesh>, scene: Scene) {
//     meshes.forEach((m, i) => {
//         setTimeout(() => {
//             scene.beginAnimation(m, 0, 120, false, 1, () => {
//                 m.dispose();
//             });
//         }, i * 10);
//     })

// }
// function appenShadowTo(light: ShadowLight, meshes: Array<Mesh>) {
//     const shadow = new ShadowGenerator(1024, light);
//     shadow.usePoissonSampling = true;
//     shadow.useExponentialShadowMap = true;
//     shadow.useBlurExponentialShadowMap = true;

//     meshes.forEach(m => {
//         shadow.addShadowCaster(m);
//     })
// }