import { Color3, MeshBuilder, PhysicsBody, PhysicsMotionType, PhysicsShapeConvexHull, Quaternion, Scene, StandardMaterial, Tools, TransformNode, Vector3 } from "@babylonjs/core";


export function shildComposition(scene: Scene) {
    const shield = new TransformNode("shield-transform-node", scene);
    const shield_physics = physicsShield(scene, shield);
    const shield_control_plane = controlShieldPlane(scene, shield);

    shield.position = new Vector3(0, 0.3, -5);
    return [shield, shield_physics, shield_control_plane];
}
function physicsShield(scene: Scene, parent: TransformNode) {
    const shield = MeshBuilder.CreateBox("shield", { width: 3, height: 0.6, depth: 0.25, wrap: true, updatable: true }, scene);
    shield.parent = parent;
    const shield_mt = new StandardMaterial(`shield-mt`, scene);
    shield_mt.diffuseColor = new Color3(0.1, 0.09, 0.2);
    shield_mt.alpha = 0.5;
    shield.material = shield_mt;
    const physics = new PhysicsBody(shield, PhysicsMotionType.ANIMATED, false, scene);
    physics.setMassProperties({ mass: 1000, inertia: new Vector3(1, 1, 1), inertiaOrientation: new Quaternion(0, 0, 0, 1) });
    const shape = new PhysicsShapeConvexHull(shield, scene);
    shape.material = { restitution: 1, friction: 0.1, staticFriction: 0.1 }
    physics.shape = shape;
    physics.setCollisionCallbackEnabled(true);
    physics.setCollisionEndedCallbackEnabled(true);
    return shield;
}
function controlShieldPlane(scene: Scene, parent: TransformNode) {
    const control_plane = MeshBuilder.CreatePlane("shield-control-plane", { width: 3.5, height: 1.5, updatable: true }, scene);
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
