import { ASSETS } from "@/game_state/assets/state";
import { UISTATE } from "@/game_state/ui/state";
import { getInnerWindow } from "@/utils/clear_utils";
import {
    Animation, CircleEase, Color3, Color4, EasingFunction, HemisphericLight, Mesh, MeshBuilder, ParticleSystem, Scene, SineEase, SpotLight,
    StandardMaterial, Texture, Tools, TransformNode, UniversalCamera, Vector3
} from "@babylonjs/core";
import { backSetOpaq_0 } from "./html/ui_components";

export function UIScene() {
    const window_size = getInnerWindow();
    const scene = new Scene(UISTATE.Engine);
    scene.clearColor = new Color4(0, 0, 0, 0);

    const camera = new UniversalCamera("ui-camera", new Vector3(0, 30, 0), scene);
    camera.fov = Tools.ToRadians(70);
    camera.target = new Vector3(0, 0, 0);
    UISTATE.Camera = camera;

    const light = new HemisphericLight("ui-light", new Vector3(0, 1, 0), scene);
    light.diffuse = new Color3(0.2, 0.2, 0.2);
    light.specular = new Color3(0.2, 0.1, 0.2);
    light.intensity = 0.5;

    const spot = new SpotLight("spot-1", new Vector3(0, 20, 0), new Vector3(0, -1, 0), Tools.ToRadians(120), 10, scene);
    spot.diffuse = new Color3(0.5, 0.3, 1);
    spot.specular = new Color3(0.4, 0.3, 0.5);
    spot.intensity = 2;

    sceneBuilder(scene);
    hero(scene);
    loader(scene);

    scene.onReadyObservable.add(() => {
        backSetOpaq_0();
        //headerSpot(scene);
        header(new Vector3(0, 11, -7), scene);
    })
    return scene;
}

function sceneBuilder(scene: Scene) {
    const window_size = getInnerWindow();
    const ground = MeshBuilder.CreateGround("ground", { width: window_size.width, height: window_size.height }, scene);
    const material = new StandardMaterial("ground-mt", scene);
    material.diffuseColor = new Color3(0.05, 0.05, 0.1);
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
    const spot = new SpotLight("spot-ball2", position, new Vector3(0, -1, 0), Tools.ToRadians(200), 10, scene);
    spot.diffuse = diffuse;
    spot.specular = specular;
    spot.intensity = 1;
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
function header(position: Vector3, scene: Scene) {
    const tn = new TransformNode("header-tn", scene);
    const plane = MeshBuilder.CreatePlane("header-palne", { width: 10, height: 2 }, scene);
    //plane.showBoundingBox = true;
    plane.setParent(tn);
    const txt = new Texture("public/sprites/head.webp", scene);
    txt.hasAlpha = true;
    const material = new StandardMaterial("header-mt", scene);
    material.diffuseTexture = txt;
    material.emissiveTexture = txt;
    material.maxSimultaneousLights = 10;
    plane.material = material;
    tn.rotation.y = Tools.ToRadians(180);
    tn.rotation.x = Tools.ToRadians(90);
    tn.position = position.multiply(new Vector3(1, 0, 1));
    const scale = 1.1;
    tn.scaling = new Vector3(scale, scale + 0.5, (scale));

    const keys = [
        {
            frame: 0,
            value: new Vector3(0, 0, -10)
        },
        {
            frame: 120,
            value: position
        }
    ];
    const anim = new Animation("headerY-anim", "position", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    anim.setKeys(keys);
    const ese = new CircleEase();
    ese.setEasingMode(EasingFunction.EASINGMODE_EASEIN);
    anim.setEasingFunction(ese);
    tn.animations.push(anim);
    scene.beginAnimation(tn, 0, 120, false, 1);
}
function headerSpot(scene: Scene) {
    const spot2 = new SpotLight("spot-2", new Vector3(0, 25, -20), new Vector3(0, -1, 0), Tools.ToRadians(200), 40, scene);
    spot2.diffuse = new Color3(0.4, 0.6, 1);
    spot2.specular = new Color3(0.4, 0.2, 0.1);
    spot2.intensity = 0;

    const anim = setInterval(() => {
        if (spot2.intensity < 10) {
            spot2.intensity += 0.05;
        }
        else {
            clearInterval(anim);
        }
    }, 10);
}