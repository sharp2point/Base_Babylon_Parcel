import { GameState } from "@/game_state/game_state";
import { Color3, HavokPlugin, Material, Mesh, MeshBuilder, Observable, PhysicsBody, PhysicsMotionType, PhysicsShapeConvexHull, Quaternion, Scene, ShadowGenerator, StandardMaterial, Vector3 } from "@babylonjs/core";

export function ballComposition(scene: Scene): Mesh {
    const ball = physicsBall(scene);
    ball["run$"] = new Observable();
    ball.onBeforeRenderObservable.add(() => {
        if (GameState.isBallStart) {
            //clearBallVelocityY(ball.getPhysicsBody())
        }
    });
    return ball;
}
function physicsBall(scene: Scene): Mesh {
    const ball = MeshBuilder.CreateSphere("ball", { diameter: 0.4, segments: 32, updatable: false }, scene);
    ball.position = new Vector3(0, 0.2, -3);
    ball.receiveShadows = true;
    const mt = new StandardMaterial("ball-mt", scene);
    mt.diffuseColor = new Color3(0.7, 0.3, 0.15);
    mt.maxSimultaneousLights = 10;
    ball.material = mt;
    const physics = new PhysicsBody(ball, PhysicsMotionType.ANIMATED, false, scene);
    physics.setMassProperties({ mass: 10 })
    const shape = new PhysicsShapeConvexHull(ball, scene);
    shape.material = { restitution: 0.5, friction: 0.1, staticFriction: 0 }
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
function ballPhysicsActivate() {
    const physics = GameState.gameObjects.ball.getPhysicsBody() as PhysicsBody
    physics.setMotionType(PhysicsMotionType.DYNAMIC)
    physics.applyImpulse(new Vector3(0, 0, 100), GameState.gameObjects.ball.getAbsolutePosition());
}
//------------OBSERVABLES--------------------------->
export function addRun$() {
    GameState.gameObjects.ball["run$"].addOnce(() => {
        GameState.isBallStart = true;
        setTimeout(() => {
            ballPhysicsActivate();
        }, 300);
    })
}
export function onRun$() {
    GameState.gameObjects.ball["run$"].notifyObservers();
}