import { Color3, DirectionalLight, EventState, HavokPlugin, HemisphericLight, IPointerEvent, Mesh, MeshBuilder, PhysicsBody, PhysicsMotionType, PhysicsShapeConvexHull, PickingInfo, PointerEventTypes, PointerInfo, Scene, StandardMaterial, Texture, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
import * as gmType from '../game_types/types';
import { Shield } from "@/objects/shield";

const sceneState = {
    gameSize: {
        width: 20, height: 40, depth: 0
    },
    isShieldTap: false,
    ballInitSpeed: 12,
    dragBox: {
        up: -7,
        down: -19,
        left: -6.5,
        rigth: 6.5
    }
}

export function sceneOne(gravity: Vector3, physicsEngine: HavokPlugin) {
    const scene = new Scene(globalThis.gameEngine);
    scene.enablePhysics(gravity, physicsEngine)
    const camera = new UniversalCamera("main-scene-camera", new Vector3(0, 8, -30), scene);
    camera.target = Vector3.Zero();
    const hemiLight = new HemisphericLight("main-scene-hemilight", new Vector3(0, -1, 0), scene);
    hemiLight.diffuse = new Color3(1, 1, 0.3);
    hemiLight.intensity = 0.7;

    const dirLight = new DirectionalLight("main-scene-dirlight", new Vector3(0, -1, 0), scene);
    dirLight.position = new Vector3(0, 10, -10);
    dirLight.diffuse = new Color3(1, 1, 1);
    dirLight.intensity = 1;

    createPhysicsEnv(scene);
    const shield = new Shield(new Vector3(0, 0, -10), scene);
    createUpLine(scene);
    //----------------- EVENTS --------------------------
    scene.onPointerDown = () => mouseDownHandler(shield, scene);
    scene.onPointerUp = () => mouseUpHandler();
    scene.onPointerMove = () => mouseMoveHandler(shield, scene);

    return scene;
}
//----------------------------------------------------------->
function createPhysicsEnv(scene: Scene) {
    const borderPosY = -0.4;
    const groundObj = createGround(sceneState.gameSize, scene);
    groundObj.addPhysics();
    createBorder("left-border", { size: { width: 1, height: 1, depth: sceneState.gameSize.height }, position: { x: -sceneState.gameSize.width / 2, y: borderPosY, z: 0 } }, scene);
    createBorder("right-border", { size: { width: 1, height: 1, depth: sceneState.gameSize.height }, position: { x: sceneState.gameSize.width / 2, y: borderPosY, z: 0 } }, scene);
    createBorder("up-border", { size: { width: sceneState.gameSize.width + 1, height: 1, depth: 1 }, position: { x: 0, y: borderPosY, z: sceneState.gameSize.height / 2 } }, scene);
    createPhysicsBorder("left-physics-border", { size: { width: 0.1, height: 5, depth: sceneState.gameSize.height }, position: { x: -sceneState.gameSize.width / 2, y: borderPosY, z: 0 } }, scene).addPhysics();
    createPhysicsBorder("right-physics-border", { size: { width: 0.1, height: 5, depth: sceneState.gameSize.height }, position: { x: sceneState.gameSize.width / 2, y: borderPosY, z: 0 } }, scene).addPhysics();
    createPhysicsBorder("up-physics-border", { size: { width: sceneState.gameSize.width + 0.05, height: 5, depth: 0.1 }, position: { x: 0, y: borderPosY, z: sceneState.gameSize.height / 2 } }, scene).addPhysics();
}
function createGround(size: gmType.gmSize, scene: Scene) {
    const mesh = MeshBuilder.CreateGround('ground', { width: size.width, height: size.height }, scene);
    const material = new StandardMaterial(`${mesh.name}-material`, scene);
    material.diffuseColor = new Color3(0.22, 0.17, 0.2);
    mesh.material = material;
    return {
        mesh: mesh,
        setParent: (parent: TransformNode) => {
            mesh.parent = parent;
        },
        addPhysics: () => {
            const physics = new PhysicsBody(mesh, PhysicsMotionType.STATIC, false, scene);
            const shape = new PhysicsShapeConvexHull(mesh, scene);
            shape.material = { restitution: 0, friction: 0 };
            physics.shape = shape;
        }
    };
}
function createBorder(name: string, options: { size: gmType.gmSize, position: gmType.gmPosition }, scene: Scene) {
    const mesh = MeshBuilder.CreateBox(name, { width: options.size.width, height: options.size.height, depth: options.size.depth });
    mesh.position = new Vector3(options.position.x, options.position.y, options.position.z);
    const material = new StandardMaterial(`${mesh.name}-material`, scene);
    material.diffuseColor = new Color3(0.3, 0.3, 0.4);
    mesh.material = material;
    return {
        mesh: mesh,
        setParent: (parent: TransformNode) => {
            mesh.parent = parent;
        },
        addPhysics: () => {
            const physics = new PhysicsBody(mesh, PhysicsMotionType.STATIC, false, scene);
            const shape = new PhysicsShapeConvexHull(mesh, scene);
            physics.shape = shape;
        }
    };
}
function createPhysicsBorder(name: string, options: { size: gmType.gmSize, position: gmType.gmPosition }, scene: Scene) {
    const mesh = MeshBuilder.CreateBox(name, { width: options.size.width, height: options.size.height, depth: options.size.depth });
    mesh.position = new Vector3(options.position.x, options.position.y, options.position.z);
    const material = new StandardMaterial(`${mesh.name}-material`, scene);
    material.diffuseColor = new Color3(0.1, 0.1, 0.1);
    material.alpha = 0.1;
    mesh.material = material;

    return {
        mesh: mesh,
        setParent: (parent: TransformNode) => {
            mesh.parent = parent;
        },
        addPhysics: () => {
            const physics = new PhysicsBody(mesh, PhysicsMotionType.STATIC, false, scene);
            const shape = new PhysicsShapeConvexHull(mesh, scene);
            physics.shape = shape;
        }
    };
}
function createUpLine(scene: Scene) {
    const y = 0.05;
    const up_line = MeshBuilder.CreateLines("up-line", {
        points: [
            new Vector3(sceneState.dragBox.left - 3, y, sceneState.dragBox.up),
            new Vector3(sceneState.dragBox.rigth + 3, y, sceneState.dragBox.up)]
    }, scene);
    const down_line = MeshBuilder.CreateLines("down-line", {
        points: [
            new Vector3(sceneState.dragBox.left - 3, y, sceneState.dragBox.down),
            new Vector3(sceneState.dragBox.rigth + 3, y, sceneState.dragBox.down)]
    }, scene);

}
//----------------------------------------------------------------->
function mouseDownHandler(shield: Shield, scene: Scene) {
    const pic = scene.pick(scene.pointerX, scene.pointerY, () => true);
    if (pic.pickedMesh && pic.pickedMesh.name === shield.name && !sceneState.isShieldTap) {
        sceneState.isShieldTap = true;
        shield.position = new Vector3(pic.pickedPoint.x, shield.position.y, pic.pickedPoint.z);
    } else {

    }
}
function mouseUpHandler() {
    if (sceneState.isShieldTap) {
        sceneState.isShieldTap = false;
        // const physics = ball.getPhysicsBody();
        // if (ball && physics.getMotionType() === PhysicsMotionType.ANIMATED) {
        //     physics.setMotionType(PhysicsMotionType.DYNAMIC);
        //     physics.applyForce(sceneState.ballInitSpeed, new Vector3(0, 0, 0));
        //     physics.setCollisionCallbackEnabled(true);
        //     physics.setCollisionEndedCallbackEnabled(true);
        // }
    }
}
function mouseMoveHandler(shield: Shield, scene: Scene) {
    if (sceneState.isShieldTap) {
        const pic = scene.pick(scene.pointerX, scene.pointerY, () => true);
        const position = Vector3.Clamp(pic.pickedPoint,
            new Vector3(sceneState.dragBox.left, shield.position.y, sceneState.dragBox.down),
            new Vector3(sceneState.dragBox.rigth, shield.position.y, sceneState.dragBox.up));
            shield.position = position;

        // shield_box.position = new Vector3(result.pickedPoint.x, shield_box.position.y, result.pickedPoint.z)
        // const physics = ball.getPhysicsBody();
        // const pivot_mesh = shield_box.getChildMeshes()[0];
        // if (ball && physics.getMotionType() === PhysicsMotionType.ANIMATED) {
        //     ball.position = shield_box.position.add(pivot_mesh.position).clone();
        //     physics.setAngularVelocity(Vector3.Zero());
        //     physics.setLinearVelocity(Vector3.Zero());
        //     globalThis.HVK.setPhysicsBodyTransformation(physics, pivot_mesh)
        // }

    }
}
//----------------------------------------------------------------->