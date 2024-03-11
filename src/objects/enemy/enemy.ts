import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";
import { appendParticles } from "@/utils/clear_utils";
import { gameObjectDispose } from "@/utils/utility";
import { AssetContainer, Color3, Color4, GlowLayer, HighlightLayer, Mesh, MeshBuilder, PBRBaseMaterial, PBRMaterial, ParticleSystem, PhysicsBody, PhysicsHelper, PhysicsMotionType, PhysicsRadialImpulseFalloff, PhysicsShapeConvexHull, PointColor, PointLight, Scalar, Scene, ShadowGenerator, SolidParticle, SolidParticleSystem, StandardMaterial, Texture, Tools, TransformNode, Vector3, setAndStartTimer } from "@babylonjs/core";
import { bonus } from "../bonus/bonus";
import { newPoints } from "../points/points";

export const ENEMYTYPES = {
    110: {
        level: 1,
        points: 10,
        lifes: 1,
        material: 'enemy-simple10-mt',
        particle: null,
        bonus: null,
    },
    125: {
        level: 2,
        points: 25,
        lifes: 2,
        material: 'enemy-simple25-mt',
        particle: null,
        bonus: null,
    },
    150: {
        level: 3,
        points: 50,
        lifes: 3,
        material: 'enemy-simple50-mt',
        particle: null,
        bonus: null,
    },
    404: {
        level: 0,
        points: 0,
        lifes: 0,
        material: 'enemy-parts-mt',
        particle: null,
        bonus: null,
    }
}

export function enemy(name: string, options: { type: number, position: Vector3, angle: number }, parent: TransformNode) {
    const enemy = physicsEnemyFromModel(name, { size: GameState.state.sizes.enemy, position: options.position }, parent);
    enemy.rotation.y = Tools.ToRadians(options.angle)
    appendPhysics(enemy, {
        collideMask: GameState.CldMasks().enemy,
        collideGroup: GameState.CldMasks().groups.enemy,
        mass: GameState.state.physicsMaterial.enemy.mass,
        shape_material: {
            restitution: GameState.state.physicsMaterial.enemy.restitution,
            friction: GameState.state.physicsMaterial.enemy.friction
        }
    });
    const enm = resetEnemy(enemy, options.type);

    enm.onBeforeRenderObservable.add(() => {
        if (enm.position.y < -0.5) {
            gameObjectDispose(enm);
        }
    })
    return enm;
}
export function addShadowToEnemy(generators: Array<ShadowGenerator>, name: string) {
    generators.forEach(generator => {
        generator.addShadowCaster(GameState.scene().getMeshByName(name), false);
    });
}
export function enemyCollideReaction(enemy: Mesh) {
    newPoints("10", enemy.position.clone());
    if (!reTypeEnemy(enemy)) {
        enemyDamageModelEffect(enemy);
    }
}
export function addBonus(enemy: Mesh, type: number, payload: number) {
    const bn = bonus(type, { payload: payload, parent: enemy }, GameState.scene());
    bn.position = new Vector3(0, 0, 0);
    GameState.Bonuses().push(bn);
}
//------------------------------------------------------------------->
function reTypeEnemy(enemy: Mesh) {
    const meta = enemy["meta"];

    switch (meta.level) {
        case 1: {
            return false;
            break;
        }
        case 2: {
            resetEnemy(enemy, 110)
            break;
        }
        case 3: {
            resetEnemy(enemy, 125);
            break;
        }
    }
    return true;
}
function resetEnemy(enemy: Mesh, type: any) {
    if (enemy["meta"] && enemy["meta"].particle) {
        (enemy["meta"].particle as ParticleSystem).dispose();
    }
    enemy["meta"] = ENEMYTYPES[type];
    const material = getMaterialByEnemyType(enemy) as PBRMaterial;
    enemy.material = material;
    const color = material.albedoColor;

    // const prt = appendParticles(`${enemy.name}-particle`, enemy, {
    //     color1: Color4.FromColor3(color, 0.5),
    //     color2: Color4.FromColor3(color, 0.5),
    //     color3: Color4.FromColor3(color, 0.5),
    //     capacity: 900, emitRate: 300, max_size: 0.2, updateSpeed: 0.01,
    //     emmitBox: new Vector3(0.9, 0.9, 0.9), lifeTime: 1, gravityY: 1.5
    // }, GameState.scene());
    // prt.start();

    // enemy["meta"].particle = prt;
    return enemy;
}
function physicsEnemyFromModel(name: string, options: { size: number, position: Vector3 }, parent: TransformNode) {
    const model = GameState.state.gameObjects.enemy.clone(name, parent);
    model.isEnabled(true);
    model.isVisible = true;
    model.scaling = new Vector3(0.6, 0.6, 0.6);
    model.position = options.position;
    return model;
}
function appendPhysics(mesh: Mesh, options: {
    collideMask: number
    collideGroup: number,
    mass: number
    shape_material: {
        restitution: number,
        friction: number,
    }
}): PhysicsBody {
    const physics = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, GameState.scene());
    physics.setMassProperties({ mass: options.mass });
    const shape = new PhysicsShapeConvexHull(mesh, GameState.scene());
    shape.material = options.shape_material;
    physics.shape = shape;
    shape.filterMembershipMask = options.collideMask;
    shape.filterCollideMask = options.collideGroup;
    return physics;
}
const getMaterialByEnemyType = (mesh: Mesh): PBRMaterial => (GameState.scene() as Scene).getMaterialByName(mesh["meta"].material) as PBRMaterial ?? null

const getMaterialByName = (name: string): PBRMaterial => (GameState.scene() as Scene).getMaterialByName(name) as PBRMaterial ?? null;
//----------------------------------------------------------
export function enemyDamageModelEffect(enemy: Mesh) {
    const asset = ASSETS.containers3D.get("enemy_damage") as AssetContainer;
    const inst = asset.instantiateModelsToScene((name: string) => `enemy-damage-${name}`, true);
    const meshes = inst.rootNodes[0].getChildMeshes();

    const tn = new TransformNode(`tn-enemies`, GameState.scene());
    GameState.damageNodes().push(tn);
    const material = getMaterialByName('enemy-parts-mt') as PBRMaterial;


    meshes.forEach((m: Mesh, inx) => {
        m.material = material;
        m.setParent(tn);
        tn.position = enemy.position.clone();

        const p = appendPhysics(m, {
            collideMask: GameState.CldMasks().enemyParts,
            collideGroup: GameState.CldMasks().groups.enemyParts,
            mass: 1, shape_material: {
                restitution: 0.1, friction: 0.5
            }
        });
        p.applyImpulse(new Vector3(Math.sin(360 / 8 * inx), 1, Math.cos(360 / 8 * inx)).multiply(new Vector3(10, 0.1, 10)),
            m.position.clone())
    });

    setAndStartTimer({
        timeout: Scalar.RandomRange(3000, 7000),
        contextObservable: GameState.scene().onBeforeRenderObservable,
        onEnded: () => {
            tn.getChildMeshes().forEach(m => m.dispose());
            tn.dispose();
        }
    });
    gameObjectDispose(enemy);
}