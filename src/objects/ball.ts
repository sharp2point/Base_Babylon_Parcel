import { GameState } from "@/game_state/game_state";
import { AGAME } from "@/game_state/main/state";
import { Color3, Color4, HavokPlugin, Light, Material, Mesh, MeshBuilder, Observable, ParticleSystem, PhysicsBody, PhysicsMotionType, PhysicsShapeConvexHull, PointLight, Quaternion, Scene, ShadowGenerator, SpotLight, StandardMaterial, Texture, Tools, TrailMesh, Vector3 } from "@babylonjs/core";

export function ballComposition(scene: Scene): Mesh {
    const ball = bodyBall(scene);
    const spot = ballSpot(ball, scene);

    ball["run$"] = new Observable();

    ball.onBeforeRenderObservable.add(() => {
        if (GameState.state.gameState === GameState.state.signals.GAME_RUN && !GameState.state.isResetBall) {
            spot.position = ball.absolutePosition.clone().add(new Vector3(0, 2.5, 0));
            if (GameState.state.isBallStart) {
                clearBallVelocityY(ball.getPhysicsBody());
                velocityControl();
                if (ball.position.z < GameState.state.dragBox.down) {
                    if (GameState.state.gameState !== GameState.state.signals.GAME_OTHER_BALL) {
                        GameState.changeGameState(GameState.state.signals.GAME_OTHER_BALL);
                    }
                }
            }
        }
    });
    return ball;
}
function bodyBall(scene: Scene): Mesh {
    const ball = MeshBuilder.CreateSphere("ball", { diameter: GameState.state.sizes.ball, segments: 32, updatable: false }, scene);
    ball.position = new Vector3(0, 0.2, GameState.state.dragBox.up);
    ball.receiveShadows = true;
    appendMaterial(ball, scene);
    appendPhysicsBody(ball, scene);
    const particle = appendParticles(ball, scene);
    particle.start();
    return ball;
}
function appendMaterial(ball: Mesh, scene: Scene) {
    const mt = new StandardMaterial("ball-mt", scene);
    mt.diffuseColor = new Color3(0.7, 0.3, 0.15);
    mt.maxSimultaneousLights = 10;
    mt.alpha = 1;
    ball.material = mt;
}
function appendPhysicsBody(ball: Mesh, scene: Scene) {
    const physics = new PhysicsBody(ball, PhysicsMotionType.ANIMATED, false, scene);
    physics.setMassProperties({ mass: GameState.state.physicsMaterial.ball.mass });
    const shape = new PhysicsShapeConvexHull(ball, scene);
    shape.material = {
        restitution: GameState.state.physicsMaterial.ball.restitution,
        friction: GameState.state.physicsMaterial.ball.friction
    }
    physics.shape = shape;
    physics.setCollisionCallbackEnabled(true);
    physics.setCollisionEndedCallbackEnabled(true);
}
function clearBallVelocityY(ball_physics: PhysicsBody) {
    ball_physics.setLinearVelocity(ball_physics.getLinearVelocity().clone().multiply(new Vector3(1, 0, 1)))
}
function ballPhysicsActivate() {
    const physics = GameState.ball().getPhysicsBody() as PhysicsBody
    physics.setMotionType(PhysicsMotionType.DYNAMIC)
    physics.applyImpulse(new Vector3(0, 0, 200), GameState.ball().getAbsolutePosition());
    physics.applyForce(new Vector3(0, 0, 2000), GameState.ball().getAbsolutePosition());
}
export function resetBall() {
    GameState.state.isResetBall = true;
    (AGAME.HVK as HavokPlugin).removeBody(GameState.ball().getPhysicsBody());
    GameState.ball().position = new Vector3(0, 0.25, GameState.state.dragBox.up);
    appendPhysicsBody(GameState.ball(), (GameState.ball() as Mesh).getScene());
    addRun$();
}
function velocityControl() {
    const phy = GameState.state.gameObjects.ball.getPhysicsBody() as PhysicsBody;
    const length = phy.getLinearVelocity().length();
    if (length < 15) {
        phy.applyImpulse((phy.getLinearVelocity().multiply(new Vector3(1.5, 0, 1.5))), GameState.state.gameObjects.ball.getAbsolutePosition());
    } else if (length > 80) {
        phy.setLinearVelocity(phy.getLinearVelocity().multiply(new Vector3(1, 0, 1)));
    }
}
function ballSpot(ball: Mesh, scene: Scene) {
    const ballSpot = new SpotLight("ball-spot", ball.position.clone().add(new Vector3(0, 1.5, 0)),
        new Vector3(0, -1, 0), Tools.ToRadians(60), 10, scene);
    ballSpot.diffuse = new Color3(0.5, 0.5, 0.5);
    ballSpot.specular = new Color3(0.5, 0.3, 0.1);
    ballSpot.intensity = 1;
    ballSpot.falloffType = Light.FALLOFF_PHYSICAL;
    ballSpot.shadowEnabled = true;
    return ballSpot
}
export function addShadowToBall(generators: Array<ShadowGenerator>, scene: Scene) {
    generators.forEach(generator => {
        generator.addShadowCaster(scene.getMeshByName('ball'), false);
    });
}
function appendParticles(ball: Mesh, scene: Scene) {
    const prt = new ParticleSystem("ball-particle", 1000, scene);
    prt.emitter = ball;
    prt.particleTexture = new Texture("public/sprites/dirt_02.png");
    prt.maxEmitPower = 1;
    prt.minEmitPower = 0.1;
    prt.emitRate = 300;
    prt.color1 = new Color4(0.9, 0.5, 0.1, 0.5);
    prt.color2 = new Color4(0.9, 0.2, 0.1, 0.9);
    prt.colorDead = new Color4(0.1, 0.1, 0.1, 0.5);
    prt.maxLifeTime = 1.0;
    prt.minLifeTime = 0.5;
    prt.minAngularSpeed = 1;
    prt.maxSize = 0.8;
    prt.minSize = 0.1;
    prt.maxEmitBox = new Vector3(0.2, 0.2, 0.2);
    prt.minEmitBox = new Vector3(-0.2, -0.2, -0.2);
    prt.updateSpeed = 0.05;
    prt.direction1 = new Vector3(0, 0, 0);
    prt.direction2 = new Vector3(0, 0, 0);
    prt.gravity = new Vector3(0, 1, 0);
    prt.disposeOnStop = true;
    return prt;
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