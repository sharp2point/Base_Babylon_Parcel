import { Color3, Material, MeshBuilder, PhysicsBody, PhysicsMotionType, PhysicsShapeConvexHull, Quaternion, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

export function ballComposition(scene: Scene) {
    const ball = physicsBall(scene);

}
function physicsBall(scene: Scene) {
    const ball = MeshBuilder.CreateSphere("ball", { diameter: 0.5, segments: 32, updatable: true }, scene);
    ball.position = new Vector3(0, 5, -4);
    const mt = new StandardMaterial("ball-mt", scene);
    mt.diffuseColor = new Color3(0.7, 0.3, 0.15);
    ball.material = mt;
    const physics = new PhysicsBody(ball, PhysicsMotionType.DYNAMIC, false, scene);
    physics.setMassProperties({ mass: 0.1, inertia: new Vector3(1, 1, 1), inertiaOrientation: new Quaternion(0, 0, 0, 1) })
    const shape = new PhysicsShapeConvexHull(ball, scene);
    shape.material = { restitution: 0.05, friction: 0.1, staticFriction: 0.1 }
    physics.shape = shape;
    physics.setCollisionCallbackEnabled(true);
    physics.setCollisionEndedCallbackEnabled(true);

    return ball;
}