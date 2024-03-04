import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";
import { AssetContainer, Texture, Vector3, Mesh, ParticleSystem, Color4, PhysicsBody, PhysicsShapeConvexHull, PhysicsMotionType, Tools } from "@babylonjs/core";
import { } from "pixi.js";

const ROCKETSTATE = {
    mass: 100000,
    restitution: 0,
    friction: 1,
    deathTime: 4000
}
export function rocketEffect(position: Vector3) {
    const rocket = instantiateBomb();
    setPosition(rocket, position);
    const physics = addPhysics(rocket);
    addParticle(rocket);
    effect(physics, position);
    saveRocketToGameState(rocket);
    rocketDispose(rocket, ROCKETSTATE.deathTime);
}
function instantiateBomb() {
    const inst = (ASSETS.containers3D.get("rocket_effect") as AssetContainer).instantiateModelsToScene((name) => name, true);
    const rocket = inst.rootNodes[0].getChildMeshes() as Array<Mesh>;
    return Mesh.MergeMeshes(rocket, true, false, null, false, true);
}
function setPosition(rocket: Mesh, position: Vector3) {
    rocket.scalingDeterminant = 0.6;
    rocket.rotation.x = Tools.ToRadians(90);
    rocket.setAbsolutePosition(position);
}
function addParticle(rocket: Mesh) {
    rocketParticles(rocket).start();
}
function addPhysics(rocket: Mesh) {
    const physics = new PhysicsBody(rocket, PhysicsMotionType.DYNAMIC, false, GameState.scene());
    const shape = new PhysicsShapeConvexHull(rocket, GameState.scene());
    physics.shape = shape;
    physics.setMassProperties({ mass: ROCKETSTATE.mass });
    shape.material = { restitution: ROCKETSTATE.restitution, friction: ROCKETSTATE.friction };
    return physics;
}
function effect(physicsRocket: PhysicsBody, impulsePosition: Vector3) {
    const vec = new Vector3(
        0, 0, ROCKETSTATE.mass * 40,
    );
    physicsRocket.applyImpulse(vec, impulsePosition);
    physicsRocket.applyForce(vec, impulsePosition);
}
function rocketParticles(part: Mesh) {
    const prt = new ParticleSystem("rocket-particle", 500, GameState.scene());
    prt.emitter = part;
    prt.particleTexture = new Texture("public/sprites/dirt_02.png");
    prt.maxEmitPower = 1;
    prt.minEmitPower = 0.1;
    prt.emitRate = 300;
    prt.color1 = new Color4(0.9, 0.1, 0.1, 0.5);
    prt.color2 = new Color4(1, 0.6, 0, 0.9);
    prt.colorDead = new Color4(0, 0, 0, 1);
    prt.maxLifeTime = 1.0;
    prt.minLifeTime = 0.5;
    prt.minAngularSpeed = 0;
    prt.maxSize = 0.8;
    prt.minSize = 0.1;
    prt.maxEmitBox = new Vector3(0.2, 0.2, 0.2);
    prt.minEmitBox = new Vector3(-0.2, -0.2, -0.2);
    prt.updateSpeed = 0.05;
    prt.direction1 = new Vector3(0, -1, 0);
    prt.direction2 = new Vector3(0, -1, 0);
    prt.gravity = new Vector3(0, -9, 0);
    prt.disposeOnStop = true;
    return prt;
}
function rocketDispose(rocket: Mesh, time: number) {
    setTimeout(() => {
        rocket.dispose();
    }, time);
}
function saveRocketToGameState(rocket: Mesh) {
    GameState.Effects().push(rocket);
}