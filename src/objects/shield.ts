import { GameState } from "@/game_state/game_state";
import { Color3, HighlightLayer, Mesh, MeshBuilder, Observable, PhysicsBody, PhysicsMotionType, PhysicsShapeConvexHull, Quaternion, Scene, ShadowGenerator, StandardMaterial, Tools, TransformNode, Vector3 } from "@babylonjs/core";


export function shildComposition(scene: Scene): [TransformNode, Mesh, Mesh] {
    const shield = new TransformNode("shield-transform-node", scene);
    const shield_physics = physicsShield(scene, shield);
    const shield_control_plane = controlShieldPlane(scene, shield);

    shield.position = new Vector3(0, 0.3, -7);
    shield["position$"] = new Observable();
    return [shield, shield_physics, shield_control_plane];
}
function physicsShield(scene: Scene, parent: TransformNode) {
    const shield = MeshBuilder.CreateBox("shield", { width: 3.5, height: 0.6, depth: 0.25, wrap: true, updatable: true }, scene);
    shield.parent = parent;
    shield.receiveShadows = true;
    const shield_mt = new StandardMaterial(`shield-mt`, scene);
    shield_mt.emissiveColor = new Color3(0.7, 0.5, 0.1);
    shield_mt.alpha = 0.8;
    shield_mt.maxSimultaneousLights = 10;
    shield.material = shield_mt;
    //addHighlight(shield);
    const physics = new PhysicsBody(shield, PhysicsMotionType.ANIMATED, false, scene);
    physics.setMassProperties({ mass: GameState.state.physicsMaterial.shield.mass });
    const shape = new PhysicsShapeConvexHull(shield, scene);
    shape.material = {
        restitution: GameState.state.physicsMaterial.shield.restitution,
        friction: GameState.state.physicsMaterial.shield.friction
    }
    physics.shape = shape;
    //physics.disablePreStep = false;
    physics.setCollisionCallbackEnabled(true);
    physics.setCollisionEndedCallbackEnabled(true);
    return shield;
}
function addHighlight(mesh: Mesh) {
    const hl = new HighlightLayer("shield-hl", GameState.scene());
    //hl.outerGlow = true;
    hl.blurHorizontalSize = 0.01;
    hl.blurVerticalSize = 0.01;
    hl.addMesh(mesh, new Color3(0.6, 0.8, 0.2));

}
function controlShieldPlane(scene: Scene, parent: TransformNode) {
    const control_plane = MeshBuilder.CreatePlane("shield-control-plane", { width: 5.5, height: 2.5, updatable: true }, scene);
    control_plane.position = new Vector3(0, 0.7, -0.5);
    control_plane.parent = parent;
    control_plane.isPickable = true;
    control_plane.rotation.x = Tools.ToRadians(90);
    const plane_mt = new StandardMaterial(`shield-mt`, scene);
    plane_mt.diffuseColor = new Color3(0.1, 0.1, 0.1);
    plane_mt.alpha = 0.2;
    control_plane.material = plane_mt;
    return control_plane;
}
export function addShadowToShield(generators: Array<ShadowGenerator>, scene: Scene) {
    generators.forEach(generator => {
        generator.addShadowCaster(scene.getMeshByName('shield'), false);
    });
}
//----------OBSERVABLES----------------->
export function addPosition$(actionFn: any) {
    GameState.shieldNode()["position$"].add(() => {
        actionFn();
    });
}
export function onPosition$() {
    GameState.shieldNode()["position$"].notifyObservers()
}
