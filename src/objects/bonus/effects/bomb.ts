import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";
import { AssetContainer, Color4, Mesh, Texture, ParticleSystem, PhysicsBody, PhysicsMotionType, PhysicsShapeConvexHull, Tools, Vector3 } from "@babylonjs/core";

const BOMBSTATE = {
    mass: 5000,
    restitution: 0.5,
    friction: 0.5,
    deathTime: 3000
}

export function bombEffect(position: Vector3) {
    const bomb = instantiateBomb() as Array<Mesh>;
    setPosition(bomb, position);
    const physics = addPhysics(bomb);
    addParticle(bomb);
    effect(physics, position);
    saveBombToGameState(bomb);
    bombDispose(bomb, BOMBSTATE.deathTime);
}
function instantiateBomb() {
    const inst = (ASSETS.containers3D.get("bomb_effect") as AssetContainer).instantiateModelsToScene((name) => name, true);
    const parts = inst.rootNodes[0].getChildMeshes();
    return parts;
}
function setPosition(parts: Array<Mesh>, position: Vector3) {
    parts.forEach((p: Mesh) => {
        p.setAbsolutePosition(position);
    });
}
function addParticle(parts: Array<Mesh>) {
    const particles = parts.map((p: Mesh) => {
        return bombParticles(p);
    });
    particles.forEach(p => {
        p.start();
    })
}
function addPhysics(parts: Array<Mesh>) {
    return parts.map((p: Mesh) => {
        const physics = new PhysicsBody(p, PhysicsMotionType.DYNAMIC, false, GameState.scene());
        const shape = new PhysicsShapeConvexHull(p, GameState.scene());
        physics.shape = shape;
        physics.setMassProperties({ mass: BOMBSTATE.mass });
        shape.material = { restitution: BOMBSTATE.restitution, friction: BOMBSTATE.friction };
        return physics;
    });
}
function effect(physicsParts: Array<PhysicsBody>, impulsePosition: Vector3) {
    physicsParts.forEach((p: PhysicsBody, inx: number) => {
        const vec = new Vector3(
            Math.sin(Tools.ToRadians(inx * 36)) * BOMBSTATE.mass * 20,
            Tools.ToRadians(inx * 36) * BOMBSTATE.mass,
            Math.cos(Tools.ToRadians(inx * 36)) * BOMBSTATE.mass * 20,
        );
        p.applyImpulse(vec, impulsePosition);
    })
}
function bombParticles(part: Mesh) {
    const prt = new ParticleSystem("ball-particle", 150, GameState.scene());
    prt.emitter = part;
    prt.particleTexture = new Texture("public/sprites/dirt_02.png");
    prt.maxEmitPower = 1;
    prt.minEmitPower = 0.1;
    prt.emitRate = 100;
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
    prt.direction1 = new Vector3(1, 0, 0);
    prt.direction2 = new Vector3(0, 0, 1);
    prt.gravity = new Vector3(0, 1, 0);
    prt.disposeOnStop = true;
    return prt;
}
function bombDispose(parts: Array<Mesh>, time: number) {
    setTimeout(() => {
        parts.forEach(p => {
            if (p) {
                p.dispose();
            }
        })
    }, time);
}
function saveBombToGameState(parts: Array<Mesh>) {
    parts.forEach(p => {
        GameState.Effects().push(p);
    })
}