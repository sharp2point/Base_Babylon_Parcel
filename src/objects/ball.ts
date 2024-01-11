import { Color3, Material, Mesh, MeshBuilder, PhysicsBody, PhysicsMotionType, PhysicsShapeConvexHull, Quaternion, Scene, ShadowGenerator, StandardMaterial, Vector3 } from "@babylonjs/core";

export function ballComposition(scene: Scene): Mesh {
    const ball = physicsBall(scene);
    ball.onBeforeRenderObservable.add(() => {
        clearBallVelocityY(ball.getPhysicsBody())
    })
    return ball;
}
function physicsBall(scene: Scene): Mesh {
    const ball = MeshBuilder.CreateSphere("ball", { diameter: 0.4, segments: 32, updatable: true }, scene);
    ball.position = new Vector3(0, 0.2, -3);
    ball.receiveShadows = true;
    const mt = new StandardMaterial("ball-mt", scene);
    mt.diffuseColor = new Color3(0.7, 0.3, 0.15);
    mt.maxSimultaneousLights = 10;
    ball.material = mt;
    const physics = new PhysicsBody(ball, PhysicsMotionType.ANIMATED, false, scene);
    physics.setMassProperties({ mass: 10 })
    const shape = new PhysicsShapeConvexHull(ball, scene);
    shape.material = { restitution: 0.5, friction: 0.1, staticFriction: 0.1 }
    physics.shape = shape;
    physics.setCollisionCallbackEnabled(true);
    physics.setCollisionEndedCallbackEnabled(true);
    return ball;
}
function clearBallVelocityY(ball_physics: PhysicsBody) {
    ball_physics.setLinearVelocity(ball_physics.getLinearVelocity().clone().multiply(new Vector3(1, 0, 1)))
}
export function addShadowToBall(generator: ShadowGenerator, scene: Scene) {
    generator.addShadowCaster(scene.getMeshByName('ball'), false);
}
export function ballPhysicsActivate(scene: Scene) {
    const ball = scene.getMeshByName("ball") as Mesh;
    const physics = ball.getPhysicsBody()
    if (ball instanceof Mesh && physics.getMotionType() === PhysicsMotionType.ANIMATED) {
        physics.setMotionType(PhysicsMotionType.DYNAMIC);
    } else {
        physics.setMotionType(PhysicsMotionType.ANIMATED);
    }
}