import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";
import { AGAME } from "@/game_state/main/state";
import { enemyDamageModelEffect } from "@/objects/enemy/enemy";
import { AssetContainer, Texture, Vector3, Mesh, ParticleSystem, Color4, PhysicsBody, PhysicsShapeConvexHull, PhysicsMotionType, Tools, IBasePhysicsCollisionEvent, EventState, AbstractMesh, SolidParticleSystem, MeshBuilder, StandardMaterial, Color3, SolidParticle, Scalar } from "@babylonjs/core";
import { } from "pixi.js";

const ROCKETSTATE = {
    mass: 10000,
    restitution: 0,
    friction: 1,
    deathTime: 1000,
    startDelay: 1500,
    isDeath: false,
}
export function rocketEffect(position: Vector3) {
    const rocket = instantiateRocket();
    rocket.receiveShadows = true;
    rocket.name = "rocket-effect";
    setPosition(rocket, position);
    addParticle(rocket);
    saveRocketToGameState(rocket);


    const onRenderPosition = GameState.scene().onBeforeRenderObservable.add(() => {
        rocket.position = GameState.shieldNode().position.clone().add(new Vector3(0, 1, 0));
    })
    setTimeout(() => {
        onRenderPosition.remove();
        const physics = addPhysics(rocket);
        rocketDispose(rocket, ROCKETSTATE.deathTime);
        effect(physics, rocket.position.clone());
    }, ROCKETSTATE.startDelay);

}
function instantiateRocket() {
    const inst = (ASSETS.containers3D.get("rocket_effect") as AssetContainer).instantiateModelsToScene((name) => name, true);
    const rocket = inst.rootNodes[0].getChildMeshes() as Array<Mesh>;
    return Mesh.MergeMeshes(rocket, true, false, null, false, true);
}
function setPosition(rocket: Mesh, position: Vector3) {
    rocket.scalingDeterminant = 0.4;
    rocket.rotation.x = Tools.ToRadians(90);
    rocket.setAbsolutePosition(position);
}
function addParticle(rocket: Mesh) {
    rocketParticles(rocket).start();
}
function addPhysics(rocket: Mesh) {
    const physics = new PhysicsBody(rocket, PhysicsMotionType.DYNAMIC, false, GameState.scene());
    physics.setGravityFactor(0);
    const shape = new PhysicsShapeConvexHull(rocket, GameState.scene());
    shape.filterMembershipMask = GameState.CldMasks().rocket;
    shape.filterCollideMask = GameState.CldMasks().groups.rocket;
    physics.shape = shape;
    physics.setMassProperties({ mass: ROCKETSTATE.mass });
    shape.material = { restitution: ROCKETSTATE.restitution, friction: ROCKETSTATE.friction };

    physics.setCollisionCallbackEnabled(true);
    // physics.setCollisionEndedCallbackEnabled(true);
    return physics;
}
function rocketParticles(part: Mesh) {
    const prt = new ParticleSystem("rocket-particle", 800, GameState.scene());
    prt.emitter = part;
    prt.particleTexture = new Texture("public/sprites/dirt_02.png");
    prt.maxEmitPower = 1;
    prt.minEmitPower = 0.1;
    prt.emitRate = 300;
    prt.color1 = new Color4(0.3, 0.1, 0.05, 0.1);
    prt.color2 = new Color4(0.7, 0.5, 0, 0.5);
    prt.colorDead = new Color4(0, 0.1, 0, 0.3);
    prt.maxLifeTime = 1.0;
    prt.minLifeTime = 0.5;
    prt.minAngularSpeed = 0;
    prt.maxSize = 0.8;
    prt.minSize = 0.4;
    prt.maxEmitBox = new Vector3(0.2, 0.2, 0.2);
    prt.minEmitBox = new Vector3(-0.2, -0.2, -0.2);
    prt.updateSpeed = 0.08;
    prt.direction1 = new Vector3(0, 0, 0);
    prt.direction2 = new Vector3(0, 0, 0);
    prt.gravity = new Vector3(0, 0, -1);
    prt.disposeOnStop = true;
    return prt;
}
function rocketDispose(rocket: Mesh, time: number) {
    setTimeout(() => {
        if (rocket.position.z > 10) {
            rocketDie(rocket);
        }
    }, time);
}
function saveRocketToGameState(rocket: Mesh) {
    GameState.Effects().push(rocket);
}
export function rocketDie(rocket: Mesh) {
    explosion(rocket.absolutePosition.clone());
    rocket.dispose();
}
function effect(rocketBody: PhysicsBody, impulsePosition: Vector3) {
    const veci = new Vector3(0, 0, ROCKETSTATE.mass * 10);
    rocketBody.applyImpulse(veci, impulsePosition);
    const vecf = new Vector3(0, 0, ROCKETSTATE.mass * 1000);
    rocketBody.applyForce(vecf, impulsePosition);
}
function explosion(position: Vector3) {
    const explosionPartsLength = 10;
    const base = MeshBuilder.CreateSphere("expl", { diameter: 0.1 }, GameState.scene());

    const parts = [...Array(explosionPartsLength).keys()].map((e) => {
        const part = base.clone(`prt-${e}`);
        part.position = position;
        explodeParticles(part).start();

        return part;
    });
    base.dispose();

    let mov = 0;
    const step = 0.005;

    const action = GameState.scene().onBeforeRenderObservable.add(() => {
        parts.forEach((p: Mesh, inx: number) => {
            const angl = Tools.ToRadians((360 / explosionPartsLength) * inx)
            p.position = p.position.clone().add(
                new Vector3(
                    Math.sin(angl) * mov,
                    0,
                    Math.cos(angl) * mov
                ));
        });
        mov += step;
    });
    setTimeout(() => {
        action.remove();
        parts.forEach((p) => p.dispose());
    }, 1000);
}
function explodeParticles(part: Mesh) {
    const prt = new ParticleSystem("rocket-particle", 500, GameState.scene());
    prt.emitter = part;
    prt.particleTexture = new Texture("public/sprites/magic_02.png");
    prt.maxEmitPower = 1;
    prt.minEmitPower = 0.1;
    prt.emitRate = 200;
    prt.color1 = new Color4(0.3, 0.1, 0.05, 0.1);
    prt.color2 = new Color4(0.7, 0.5, 0, 0.5);
    prt.colorDead = new Color4(0.1, 0.0, 0.5, 0.3);
    prt.maxLifeTime = 0.8;
    prt.minLifeTime = 0.2;
    prt.minAngularSpeed = 1;
    prt.maxSize = 0.6;
    prt.minSize = 0.1;
    prt.maxEmitBox = new Vector3(0.3, 0.3, 0.3);
    prt.minEmitBox = new Vector3(-0.1, -0.1, -0.1);
    prt.updateSpeed = 0.05;
    prt.direction1 = new Vector3(0, 0, 0);
    prt.direction2 = new Vector3(0, 0, 0);
    prt.gravity = new Vector3(0, -10, 0);
    prt.disposeOnStop = true;
    return prt;
}