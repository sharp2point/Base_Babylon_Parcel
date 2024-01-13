import { GameState } from "@/game_state/game_state";
import { Color3, HavokPlugin, Light, Material, Mesh, MeshBuilder, Observable, PhysicsBody, PhysicsMotionType, PhysicsShapeConvexHull, Quaternion, Scene, ShadowGenerator, SpotLight, StandardMaterial, Tools, Vector3 } from "@babylonjs/core";


function physicsBall(scene: Scene): Mesh {
    const ball = MeshBuilder.CreateSphere("ball", { diameter: GameState.state.sizes.ball, segments: 32, updatable: false }, scene);
    ball.position = new Vector3(0, 0.2, -3);
    ball.receiveShadows = true;
    const mt = new StandardMaterial("ball-mt", scene);
    mt.diffuseColor = new Color3(0.7, 0.3, 0.15);
    mt.maxSimultaneousLights = 10;
    ball.material = mt;
    const physics = new PhysicsBody(ball, PhysicsMotionType.ANIMATED, false, scene);
    restitution: GameState.state.physicsMaterial.ball.restitution,
        physics.setMassProperties({ mass: GameState.state.physicsMaterial.ball.mass })
    const shape = new PhysicsShapeConvexHull(ball, scene);
    shape.material = {
        restitution: GameState.state.physicsMaterial.ball.restitution,
        friction: GameState.state.physicsMaterial.ball.friction
    }
    physics.shape = shape;
    physics.setCollisionCallbackEnabled(true);
    physics.setCollisionEndedCallbackEnabled(true);
    return ball;
}
function clearBallVelocityY(ball_physics: PhysicsBody) {
    ball_physics.setLinearVelocity(ball_physics.getLinearVelocity().clone().multiply(new Vector3(1, 0, 1)))
}
function ballPhysicsActivate() {
    const physics = GameState.state.gameObjects.ball.getPhysicsBody() as PhysicsBody
    physics.setMotionType(PhysicsMotionType.DYNAMIC)
    physics.applyImpulse(new Vector3(0, 0, 100), GameState.state.gameObjects.ball.getAbsolutePosition());
}
function velocityControl() {
    const phy = GameState.state.gameObjects.ball.getPhysicsBody() as PhysicsBody;
    const length = phy.getLinearVelocity().length();
    if (length < 10) {
        phy.applyImpulse((phy.getLinearVelocity().multiply(new Vector3(1.1, 0, 1.1))), GameState.state.gameObjects.ball.getAbsolutePosition());
    } else if (length > 30) {
        phy.setLinearVelocity(phy.getLinearVelocity().multiply(new Vector3(1, 0, 1)));
    }
}

export function ballComposition(scene: Scene): Mesh {
    const ball = physicsBall(scene);
    const ballSpot = new SpotLight("ball-spot", ball.position.clone().add(new Vector3(0, 1.5, 0)),
        new Vector3(0, -1, 0), Tools.ToRadians(50), 5, GameState.state.gameObjects.scene);
    ballSpot.diffuse = new Color3(0.5, 0.5, 0.5);
    ballSpot.specular = new Color3(0.9, 0.8, 0.8);
    ballSpot.intensity = 1.5;
    ballSpot.falloffType = Light.FALLOFF_PHYSICAL;
    ballSpot.shadowEnabled = true;

    ball["run$"] = new Observable();
    ball.onBeforeRenderObservable.add(() => {
        ballSpot.position = ball.absolutePosition.clone().add(new Vector3(0, 1.5, 0));
        if (GameState.state.isBallStart) {

            clearBallVelocityY(ball.getPhysicsBody());
            velocityControl();
            if (ball.position.z < (GameState.state.dragBox.down + 1)) {
                GameState.state.changeGameState(GameState.state.signals.GAME_OTHER_BALL);
            }
        }
    });
    return ball;
}
export function addShadowToBall(generator: ShadowGenerator, scene: Scene) {
    generator.addShadowCaster(scene.getMeshByName('ball'), false);
}

//------------OBSERVABLES--------------------------->
export function addRun$() {
    GameState.state.gameObjects.ball["run$"].addOnce(() => {
        GameState.state.isBallStart = true;
        setTimeout(() => {
            ballPhysicsActivate();
        }, 100);
    })
}
export function onRun$() {
    GameState.state.gameObjects.ball["run$"].notifyObservers();
}