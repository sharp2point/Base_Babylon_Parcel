import { GameState } from "@/game_state/game_state";
import { ballComposition } from "@/objects/ball";
import { shildComposition } from "@/objects/shield";
import { clampToBoxShieldPosition } from "@/utils/utility";
import {
    Color3, Color4, DirectionalLight, EventState, HavokPlugin,
    HemisphericLight, IBasePhysicsCollisionEvent, IPointerEvent, Mesh,
    MeshBuilder, PhysicsBody, PhysicsMotionType, PhysicsShapeConvexHull,
    PhysicsViewer,
    PickingInfo, PointerEventTypes, PointerInfo, Quaternion, Scene, ShadowGenerator,
    StandardMaterial, Texture, Tools, TransformNode, UniversalCamera, Vector3
} from "@babylonjs/core";


export function sceneOne(gravity: Vector3, physicsEngine: HavokPlugin) {
    const scene = initScene(gravity, physicsEngine);
    const camera = addCamera(scene);
    const [hemiLight, dirLight, shadowGen] = [...addLights(scene)];
    const world_node = createWorld(scene);
    const [shield, shield_physics, shield_control_plane] = shildComposition(scene);
    const ball = ballComposition(scene);
    //------------------------------------------------------->
    scene.onPointerDown = (evt: IPointerEvent, pickInfo: PickingInfo, type: PointerEventTypes) => {
        pointerDownHandler(pickInfo, scene);
    };
    scene.onPointerUp = pointerUpHandler;
    scene.onPointerMove = (evt: IPointerEvent, pickInfo: PickingInfo, type: PointerEventTypes) => {
        pointerMoveHandler(pickInfo, shield, scene);
    }
    scene.onBeforeRenderObservable.add(() => {
        //(globalThis.HVK as HavokPlugin).setPhysicsBodyTransformation(shield_physics.getPhysicsBody(), shield)
        (globalThis.HVK as HavokPlugin).setTargetTransform(shield_physics.getPhysicsBody(), shield.position, Quaternion.Identity())
    });
    (globalThis.HVK as HavokPlugin).onCollisionObservable.add((eventData: IBasePhysicsCollisionEvent, eventState: EventState) => {

        if (eventData.collidedAgainst.transformNode.name === "shield" || eventData.collider.transformNode.name === "shield") {
            console.log("Collider: ", eventData.collider.transformNode.name);
            console.log("Against: ", eventData.collidedAgainst.transformNode.name);
        }

    });
    (globalThis.HVK as HavokPlugin).onCollisionEndedObservable.add((eventData: IBasePhysicsCollisionEvent, eventState: EventState) => {

    });
    //----------------- DEBUG -------------->
    debugPhysicsInfo(scene);
    return scene;
}
//--------------------------------->
function initScene(gravity: Vector3, physicsEngine: HavokPlugin) {
    const scene = new Scene(globalThis.gameEngine);
    scene.enablePhysics(gravity, physicsEngine);
    scene.clearColor = new Color4(0.05, 0.04, 0.06, 1)

    return scene;
}
function addCamera(scene: Scene) {
    const camera = new UniversalCamera("main-scene-camera", new Vector3(0, 5, -10), scene);
    camera.fov = Tools.ToRadians(80);
    camera.target = Vector3.Zero();
    return camera;
}
function addLights(scene: Scene) {
    const hemiLight = new HemisphericLight("main-scene-hemilight", new Vector3(0, -1, 0), scene);
    hemiLight.diffuse = new Color3(1, 1, 0.3);
    hemiLight.intensity = 0.7;

    const dirLight = new DirectionalLight("main-scene-dirlight", new Vector3(0, -1, 0), scene);
    dirLight.position = new Vector3(0, 10, -10);
    dirLight.diffuse = new Color3(1, 1, 1);
    dirLight.intensity = 1;

    const shadowGen = new ShadowGenerator(1024, dirLight);


    return [hemiLight, dirLight, shadowGen];
}
function createWorld(scene: Scene) {
    const world_node = new TransformNode("world-transform-node", scene);
    const ground = MeshBuilder.CreateGround("ground", { width: 12, height: 20, updatable: true }, scene);
    const ground_mt = new StandardMaterial(`${ground.name}-mt`, scene);
    ground_mt.diffuseColor = new Color3(0.21, 0.19, 0.21);
    ground.material = ground_mt;
    ground.parent = world_node;
    const phy_g = new PhysicsBody(ground, PhysicsMotionType.STATIC, false, scene);
    const shape_g = new PhysicsShapeConvexHull(ground, scene);
    phy_g.shape = shape_g;

    const left_wall = MeshBuilder.CreateBox("left-wall", { width: 0.1, height: 2, depth: 20, updatable: true }, scene);
    left_wall.position = new Vector3(-5.9, 1, 0);
    const wall_mt = new StandardMaterial(`wall-mt`, scene);
    wall_mt.diffuseColor = new Color3(0.3, 0.25, 0.35);
    wall_mt.alpha = 0.05;
    left_wall.material = wall_mt;
    left_wall.parent = world_node;
    const phy_lw = new PhysicsBody(left_wall, PhysicsMotionType.STATIC, false, scene);
    const shape_lw = new PhysicsShapeConvexHull(left_wall, scene);
    phy_lw.shape = shape_lw;

    const right_wall = left_wall.clone("right-wall", world_node, true, false);
    right_wall.position = new Vector3(5.9, 1, 0);
    const phy_rw = new PhysicsBody(right_wall, PhysicsMotionType.STATIC, false, scene);
    const shape_rw = new PhysicsShapeConvexHull(right_wall, scene);
    phy_rw.shape = shape_rw;

    const up_wall = MeshBuilder.CreateBox("up-wall", { width: 12, height: 2, depth: 0.1, updatable: true }, scene);
    up_wall.position = new Vector3(0, 1, 10);
    up_wall.material = wall_mt;
    up_wall.parent = world_node;
    const phy_uw = new PhysicsBody(up_wall, PhysicsMotionType.STATIC, false, scene);
    const shape_uw = new PhysicsShapeConvexHull(up_wall, scene);
    phy_uw.shape = shape_uw;

    return world_node;
}
//---------------------------------->
function pointerDownHandler(pickInfo: PickingInfo, scene: Scene) {
    const pic = scene.pick(scene.pointerX, scene.pointerY, () => true);
    if (pic.pickedMesh.name === "shield-control-plane") {
        GameState.isDragShield = true;
    }
}
function pointerUpHandler(evt: IPointerEvent, pickInfo: PickingInfo, type: PointerEventTypes) {
    if (GameState.isDragShield) {
        GameState.isDragShield = false;
    }
}
function pointerMoveHandler(pickInfo: PickingInfo, shield: TransformNode, scene: Scene) {
    if (GameState.isDragShield) {
        const pic = scene.pick(scene.pointerX, scene.pointerY, () => true);
        if (pic.pickedMesh.name === "shield-control-plane") {

        }
        clampToBoxShieldPosition(pic.pickedPoint, shield, pic.pickedPoint);

    }
}
//--------------------------->
function debugPhysicsInfo(scene: Scene) {
    const pv = new PhysicsViewer();
    const ball = scene.getMeshByName("ball");
    const shield = scene.getMeshByName("shield");
    pv.showBody(ball.physicsBody);
    pv.showBody(shield.physicsBody);
    // for (const m of scene.rootNodes) {
    //     if (m instanceof Mesh) {
    //         if (m.physicsBody) {
    //             const dm = pv.showBody(m.physicsBody);
    //         }
    //     }
    // }
}