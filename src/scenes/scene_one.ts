import { GameState } from "@/game_state/game_state";
import { addRun$, addShadowToBall, ballComposition, onRun$ } from "@/objects/ball";
import { addPosition$, addShadowToShield, onPosition$, shildComposition } from "@/objects/shield";
import { clampToBoxShieldPosition, debugPhysicsInfo } from "@/utils/utility";
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
    dragBoxLines();

    const [shield, shield_physics, shield_control_plane] = shildComposition(scene);
    GameState.state.gameObjects.scene = scene;
    GameState.state.gameObjects.shield = shield;
    GameState.state.gameObjects.ball = ballComposition(scene);
    GameState.state.gameObjects.shadow = shadowGen;
    addShadowsToObjects(shadowGen, scene);
    //--------- OBSERVER -------->
    addRun$();
    addPosition$(() => { });
    //----------- EVENTS -------->
    addSceneEvents(GameState.state.gameObjects.ball, shield, shield_physics, scene);

    (globalThis.HVK as HavokPlugin).onCollisionObservable.add((eventData: IBasePhysicsCollisionEvent, eventState: EventState) => {

        if (eventData.collidedAgainst.transformNode.name === "shield" || eventData.collider.transformNode.name === "shield") {
            // console.log("Collider: ", eventData.collider.transformNode.name);
            // console.log("Against: ", eventData.collidedAgainst.transformNode.name);
        }

    });
    (globalThis.HVK as HavokPlugin).onCollisionEndedObservable.add((eventData: IBasePhysicsCollisionEvent, eventState: EventState) => {
        const ball_physics = GameState.state.gameObjects.ball.getPhysicsBody() as PhysicsBody;
        ball_physics.applyForce(ball_physics.getLinearVelocity().clone().normalize().multiply(new Vector3(20, 0, 20)),
            GameState.state.gameObjects.ball.getAbsolutePosition())
    });
    //----------------- DEBUG -------------->
    //debugPhysicsInfo(scene);
    GameState.state.createMap(1);
    return scene;
}
//--------------------------------->
function initScene(gravity: Vector3, physicsEngine: HavokPlugin) {
    const scene = new Scene(globalThis.gameEngine);
    scene.enablePhysics(gravity, physicsEngine);
    scene.clearColor = new Color4(0.05, 0.04, 0.06, 1);
    scene.ambientColor = new Color3(1, 0.1, 1);

    return scene;
}
function addCamera(scene: Scene) {
    const camera = new UniversalCamera("main-scene-camera", new Vector3(0, 5, -10), scene);
    camera.fov = Tools.ToRadians(80);
    camera.target = Vector3.Zero();
    return camera;
}
function addLights(scene: Scene): [HemisphericLight, DirectionalLight, ShadowGenerator] {
    const hemiLight = new HemisphericLight("main-scene-hemilight", new Vector3(0, 1, 0), scene);
    hemiLight.diffuse = new Color3(1, 1, 1);
    hemiLight.intensity = 0.7;

    const dirLight = new DirectionalLight("main-scene-dirlight", new Vector3(0, -1, -1), scene);
    dirLight.position = new Vector3(0, 20, -20);
    dirLight.diffuse = new Color3(1, 1, 1);
    dirLight.specular = new Color3(0.25, 0.25, 0.2);
    dirLight.intensity = 0.9;

    const shadowGen = new ShadowGenerator(1024, dirLight);
    shadowGen.usePoissonSampling = true;
    shadowGen.useExponentialShadowMap = true;
    shadowGen.useBlurExponentialShadowMap = true;

    return [
        hemiLight, dirLight, shadowGen
    ];
}
function createWorld(scene: Scene) {
    const world_node = new TransformNode("world-transform-node", scene);
    const ground = MeshBuilder.CreateGround("ground", {
        width: GameState.state.sizes.gameBox.width,
        height: GameState.state.sizes.gameBox.height, updatable: true
    }, scene);
    ground.receiveShadows = true;
    const ground_mt = new StandardMaterial(`${ground.name}-mt`, scene);
    ground_mt.diffuseColor = new Color3(0.21, 0.19, 0.21);
    ground_mt.maxSimultaneousLights = 10;
    ground.material = ground_mt;
    ground.parent = world_node;
    const phy_g = new PhysicsBody(ground, PhysicsMotionType.STATIC, false, scene);
    const shape_g = new PhysicsShapeConvexHull(ground, scene);
    shape_g.material = {
        restitution: GameState.state.physicsMaterial.ground.restitution,
        friction: GameState.state.physicsMaterial.ground.friction
    }
    phy_g.shape = shape_g;
    //---------- WALLS ------------->
    const left_wall = MeshBuilder.CreateBox("left-wall", {
        width: 0.1, height: 2,
        depth: GameState.state.sizes.gameBox.height, updatable: true
    }, scene);
    left_wall.position = new Vector3(-GameState.state.sizes.gameBox.width / 2, 1, 0);
    const wall_mt = new StandardMaterial(`wall-mt`, scene);
    wall_mt.diffuseColor = new Color3(0.3, 0.25, 0.35);
    wall_mt.alpha = 0.5;
    left_wall.material = wall_mt;
    left_wall.parent = world_node;
    const phy_lw = new PhysicsBody(left_wall, PhysicsMotionType.STATIC, false, scene);
    const shape_lw = new PhysicsShapeConvexHull(left_wall, scene);
    shape_lw.material = {
        restitution: GameState.state.physicsMaterial.wall.restitution,
        friction: GameState.state.physicsMaterial.wall.friction
    }
    phy_lw.shape = shape_lw;

    const right_wall = left_wall.clone("right-wall", world_node, true, false);
    right_wall.position = new Vector3(GameState.state.sizes.gameBox.width / 2, 1, 0);
    const phy_rw = new PhysicsBody(right_wall, PhysicsMotionType.STATIC, false, scene);
    const shape_rw = new PhysicsShapeConvexHull(right_wall, scene);
    shape_rw.material = {
        restitution: GameState.state.physicsMaterial.wall.restitution,
        friction: GameState.state.physicsMaterial.wall.friction
    }
    phy_rw.shape = shape_rw;

    const up_wall = MeshBuilder.CreateBox("up-wall", {
        width: GameState.state.sizes.gameBox.width,
        height: 2, depth: 0.1, updatable: true
    }, scene);
    up_wall.position = new Vector3(0, 1, GameState.state.sizes.gameBox.height / 2);
    up_wall.material = wall_mt;
    up_wall.parent = world_node;
    const phy_uw = new PhysicsBody(up_wall, PhysicsMotionType.STATIC, false, scene);
    const shape_uw = new PhysicsShapeConvexHull(up_wall, scene);
    shape_uw.material = {
        restitution: GameState.state.physicsMaterial.wall.restitution,
        friction: GameState.state.physicsMaterial.wall.friction
    }
    phy_uw.shape = shape_uw;

    return world_node;
}
function dragBoxLines() {
    const upline = MeshBuilder.CreateLines("up-line", {
        points: [new Vector3(GameState.state.dragBox.left, 0.1, GameState.state.dragBox.up),
        new Vector3(0, 0.1, GameState.state.dragBox.up),
        new Vector3(GameState.state.dragBox.rigth, 0.1, GameState.state.dragBox.up)],
        colors: [new Color4(0.3, 0.5, 0.5, 1), new Color4(0.9, 0.5, 0.5, 1), new Color4(0.3, 0.5, 0.5, 1)]
    }, GameState.state.gameObjects.scene);
    const downline = MeshBuilder.CreateLines("down-line", {
        points: [new Vector3(GameState.state.dragBox.left, 0.1, GameState.state.dragBox.down),
        new Vector3(0, 0.1, GameState.state.dragBox.down),
        new Vector3(GameState.state.dragBox.rigth, 0.1, GameState.state.dragBox.down)],
        colors: [new Color4(0.3, 0.5, 0.5, 1), new Color4(0.9, 0.5, 0.5, 1), new Color4(0.3, 0.5, 0.5, 1)]
    }, GameState.state.gameObjects.scene)
}
function addShadowsToObjects(generator: ShadowGenerator, scene: Scene) {
    addShadowToBall(generator, scene);
    addShadowToShield(generator, scene);
}
//---------------------------------->
function addSceneEvents(ball: Mesh, shield: TransformNode, shield_physics: Mesh, scene: Scene) {
    scene.onPointerDown = (evt: IPointerEvent, pickInfo: PickingInfo, type: PointerEventTypes) => {
        pointerDownHandler(pickInfo, scene);
    };
    scene.onPointerUp = (evt: IPointerEvent, pickInfo: PickingInfo, type: PointerEventTypes) => {
        pointerUpHandler(scene);
    }
    scene.onPointerMove = (evt: IPointerEvent, pickInfo: PickingInfo, type: PointerEventTypes) => {
        pointerMoveHandler(pickInfo, shield, scene);
    }
    scene.onBeforeRenderObservable.add(() => {
        ballJoinShield();
        (globalThis.HVK as HavokPlugin).setTargetTransform(shield_physics.getPhysicsBody(), shield.position, Quaternion.Identity())
    });
}
function pointerDownHandler(pickInfo: PickingInfo, scene: Scene) {
    const pic = scene.pick(scene.pointerX, scene.pointerY, () => true);
    if (pic.pickedMesh.name === "shield-control-plane") {
        GameState.state.isDragShield = true;
    }
}
function pointerUpHandler(scene: Scene) {
    if (GameState.state.isDragShield) {
        GameState.state.isDragShield = false;
        onRun$()
    }
}
function pointerMoveHandler(pickInfo: PickingInfo, shield: TransformNode, scene: Scene) {
    if (GameState.state.isDragShield) {
        const pic = scene.pick(scene.pointerX, scene.pointerY, () => true);
        onPosition$();
        clampToBoxShieldPosition(pic.pickedPoint, shield, pic.pickedPoint);
    }
}
//--------------------------->
function ballJoinShield() {
    if (!GameState.state.isBallStart) {
        GameState.state.gameObjects.ball.getPhysicsBody().setTargetTransform(GameState.state.gameObjects.shield.position.clone().add(new Vector3(0, 0, 0.5)), Quaternion.Identity())
    }
}