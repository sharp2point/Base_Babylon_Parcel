import { Color3, Color4, DirectionalLight, EventState, HavokPlugin, HemisphericLight, IPhysicsCollisionEvent, IPointerEvent, IShadowLight, Mesh, MeshBuilder, PhysicsBody, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeConvexHull, PickingInfo, PointerEventTypes, PointerInfo, Quaternion, Scene, ShadowGenerator, StandardMaterial, Texture, Tools, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
import * as gmType from '../game_types/types';
import { Shield } from "@/objects/shield";
import { Ball } from "@/objects/ball";

const sceneState = {
    shield: null,
    ball: null,
    envTransformNode: null,
    gameSize: {
        width: 20, height: 40, depth: 0
    },
    isShieldTap: false,
    shieldSize: {
        width: 3.5, height: 1, depth: 1
    },
    ballSize: 0.5,
    ballInitSpeed: 12,
    dragBox: {
        up: -7,
        down: -19,
        left: -7.5,
        rigth: 7.5
    }
}

export function sceneOne(gravity: Vector3, physicsEngine: HavokPlugin) {
    const scene = new Scene(globalThis.gameEngine);
    scene.enablePhysics(gravity, physicsEngine);
    const camera = new UniversalCamera("main-scene-camera", new Vector3(0, 8, -30), scene);
    camera.target = Vector3.Zero();

    const hemiLight = new HemisphericLight("main-scene-hemilight", new Vector3(0, -1, 0), scene);
    hemiLight.diffuse = new Color3(1, 1, 1);
    hemiLight.intensity = 1;

    const dir_light = new DirectionalLight("main-scene-dirlight", new Vector3(0, -1, 0), scene);
    dir_light.position = new Vector3(0, 10, -10);
    dir_light.diffuse = new Color3(1, 1, 1);
    dir_light.specular = new Color3(0.8, 0.7, 0.1);
    dir_light.intensity = 1.1;

    const shadow_gen = new ShadowGenerator(1024, dir_light);
    //------------------------------------------------------------------->
    testPhysicsMesh(new Vector3(0, 0, 10), scene);
    //-------------------------------------------------------------------->
    createPhysicsEnv(scene);
    const shield = new Shield(sceneState.shieldSize, new Vector3(0, 0, -10), scene);
    shield.addShadow(shadow_gen);
    const ball = new Ball(sceneState.ballSize, new Vector3(0, sceneState.ballSize / 2, -8), scene);
    ball.addShadow(shadow_gen);
    shield.addBallObservable(ball);

    createConstraintLines(scene);
    //----------------- EVENTS --------------------------
    scene.onPointerDown = () => mouseDownHandler(shield, scene);
    scene.onPointerUp = () => mouseUpHandler(ball);
    scene.onPointerMove = () => mouseMoveHandler(shield, ball, scene);

    const logger = testDist(10)
    scene.onBeforeRenderObservable.add(() => {
        if (ball.isDynamic) {
            ball.clearYPOS();
            //logger(shield.position, ball.position);
            if (ball.position.z < shield.position.z + 1) {
                const deltaShieldXZ = shield.deltaXZ;
                ball.ballShieldReaction();
            }
            //const ballToGround = testMeshToMeshIntersect(ball.mesh, scene.getMeshByName('ground') as Mesh);

        }
    })
    globalThis.HVK.onCollisionEndedObservable.add((eventData: IPhysicsCollisionEvent) => {
        ball.onCollisionEndHandler(eventData, scene);
    });
    return scene;
}

//----------------------------------------------------------->

function createPhysicsEnv(scene: Scene) {
    const borderPosY = -0.4;
    sceneState.envTransformNode = new TransformNode("env-transform-node", scene);
    createGround(sceneState.gameSize, scene).parent = sceneState.envTransformNode;
    createBorder("left-border", { size: { width: 1, height: 1, depth: sceneState.gameSize.height }, position: { x: -sceneState.gameSize.width / 2, y: borderPosY, z: 0 } }, scene).parent = sceneState.envTransformNode;
    createBorder("right-border", { size: { width: 1, height: 1, depth: sceneState.gameSize.height }, position: { x: sceneState.gameSize.width / 2, y: borderPosY, z: 0 } }, scene).parent = sceneState.envTransformNode;
    createBorder("up-border", { size: { width: sceneState.gameSize.width + 1, height: 1, depth: 1 }, position: { x: 0, y: borderPosY, z: sceneState.gameSize.height / 2 } }, scene).parent = sceneState.envTransformNode;
    createPhysicsBorder("left-physics-border", { size: { width: 0.1, height: 5, depth: sceneState.gameSize.height }, position: { x: -sceneState.gameSize.width / 2, y: borderPosY, z: 0 } }, scene).parent = sceneState.envTransformNode;
    createPhysicsBorder("right-physics-border", { size: { width: 0.1, height: 5, depth: sceneState.gameSize.height }, position: { x: sceneState.gameSize.width / 2, y: borderPosY, z: 0 } }, scene).parent = sceneState.envTransformNode;
    createPhysicsBorder("up-physics-border", { size: { width: sceneState.gameSize.width + 0.05, height: 5, depth: 0.1 }, position: { x: 0, y: borderPosY, z: sceneState.gameSize.height / 2 } }, scene).parent = sceneState.envTransformNode;
}
function createGround(size: gmType.gmSize, scene: Scene) {
    const mesh = MeshBuilder.CreateGround('ground', { width: size.width, height: size.height }, scene);
    const material = new StandardMaterial(`${mesh.name}-material`, scene);
    material.diffuseColor = new Color3(0.22, 0.17, 0.2);
    mesh.material = material;
    mesh.receiveShadows = true;
    const physics = new PhysicsBody(mesh, PhysicsMotionType.STATIC, false, scene);
    const shape = new PhysicsShapeConvexHull(mesh, scene);
    shape.material = { restitution: 0, friction: 0 };
    physics.shape = shape;
    return mesh
}
function createBorder(name: string, options: { size: gmType.gmSize, position: gmType.gmPosition }, scene: Scene) {
    const mesh = MeshBuilder.CreateBox(name, { width: options.size.width, height: options.size.height, depth: options.size.depth });
    mesh.position = new Vector3(options.position.x, options.position.y, options.position.z);
    const material = new StandardMaterial(`${mesh.name}-material`, scene);
    material.diffuseColor = new Color3(0.3, 0.3, 0.4);
    mesh.material = material;
    return mesh;
}
function createPhysicsBorder(name: string, options: { size: gmType.gmSize, position: gmType.gmPosition }, scene: Scene) {
    const mesh = MeshBuilder.CreateBox(name, { width: options.size.width, height: options.size.height, depth: options.size.depth });
    mesh.position = new Vector3(options.position.x, options.position.y + 1, options.position.z);
    mesh.material = new StandardMaterial(`${mesh.name}-material`, scene);
    mesh.material.alpha = 0.01;

    const physics = new PhysicsBody(mesh, PhysicsMotionType.STATIC, false, scene);
    const shape = new PhysicsShapeConvexHull(mesh, scene);
    shape.material = { restitution: 1, friction: 0 }
    physics.shape = shape;

    return mesh;
}
function createConstraintLines(scene: Scene) {
    const y = 0.05;
    const colors = [
        new Color4(1, 0, 0, 1),
        new Color4(0, 1, 0, 1),
        new Color4(1, 0, 0, 1),
    ];
    MeshBuilder.CreateLines("up-line", {
        colors: colors,
        points: [
            new Vector3(sceneState.dragBox.left - 3, y, sceneState.dragBox.up),
            new Vector3(0, y, sceneState.dragBox.up),
            new Vector3(sceneState.dragBox.rigth + 3, y, sceneState.dragBox.up)]
    }, scene).parent = sceneState.envTransformNode;
    MeshBuilder.CreateLines("down-line", {
        colors: colors,
        points: [
            new Vector3(sceneState.dragBox.left - 3, y, sceneState.dragBox.down),
            new Vector3(0, y, sceneState.dragBox.down),
            new Vector3(sceneState.dragBox.rigth + 3, y, sceneState.dragBox.down)]
    }, scene).parent = sceneState.envTransformNode;
}
//----------------EVENT HANDLERS----------------------------------->
function mouseDownHandler(shield: Shield, scene: Scene) {
    const pic = scene.pick(scene.pointerX, scene.pointerY, () => true);
    if (pic.pickedMesh && pic.pickedMesh.name === shield.name && !sceneState.isShieldTap) {
        sceneState.isShieldTap = true;
        shield.position = new Vector3(pic.pickedPoint.x, shield.position.y, pic.pickedPoint.z);
    }
}
function mouseUpHandler(ball: Ball) {
    if (sceneState.isShieldTap) {
        sceneState.isShieldTap = false;
        ball.toDynamic();
    }
}
function mouseMoveHandler(shield: Shield, ball: Ball, scene: Scene) {
    if (sceneState.isShieldTap) {
        const pic = scene.pick(scene.pointerX, scene.pointerY, () => true);
        clampToBoxShieldPosition(pic.pickedPoint, shield);
        shield.onPositionObserver();
    }
}

//----------------------UTILS--------------------------------->
function clampToBoxShieldPosition(position: Vector3, shield: Shield) {
    shield.position = Vector3.Clamp(position,
        new Vector3(sceneState.dragBox.left, shield.position.y, sceneState.dragBox.down),
        new Vector3(sceneState.dragBox.rigth, shield.position.y, sceneState.dragBox.up));
}
function testMeshToMeshIntersect(mesh1: Mesh, mesh2: Mesh) {
    return mesh1.intersectsMesh(mesh2) ? true : false;
}
function testDist(count: number) {
    let cnt = count;
    return (pos1: Vector3, pos2: Vector3) => {
        cnt -= 1;
        if (cnt === 0) {            //
            cnt = count;
            const z_dist = pos1.z - pos2.z;
            const x_dist = pos1.x - pos2.x
            if (z_dist > -2.5) {
                console.clear();
                console.log("POS_Z: ", z_dist);
                if (x_dist > -1.5 && x_dist < 1.5) {
                    console.log("POS_X: ", x_dist);
                }
            }
        }
    }
}
function testPhysicsMesh(position: Vector3, scene: Scene) {
    const mesh = MeshBuilder.CreateBox("test-mesh", { size: 2 }, globalThis.gameWorkScene);
    mesh.position = position;
    mesh.rotation.y = Tools.ToRadians(45);
    const physics = new PhysicsBody(mesh, PhysicsMotionType.STATIC, false, scene);
    const shape = new PhysicsShapeConvexHull(mesh, scene);
    shape.material = { restitution: 1, friction: 0 }
    physics.shape = shape;
}