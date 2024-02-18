import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";
import { appendParticles } from "@/utils/clear_utils";
import { gameObjectDispose } from "@/utils/utility";
import { AssetContainer, Color3, Color4, HighlightLayer, Mesh, MeshBuilder, PBRBaseMaterial, PBRMaterial, ParticleSystem, PhysicsBody, PhysicsHelper, PhysicsMotionType, PhysicsRadialImpulseFalloff, PhysicsShapeConvexHull, PointColor, PointLight, Scalar, Scene, ShadowGenerator, SolidParticle, SolidParticleSystem, StandardMaterial, Texture, TransformNode, Vector3, setAndStartTimer } from "@babylonjs/core";

export const ENEMYTYPES = {
    simple10: {
        level: 1,
        points: 10,
        lifes: 1,
        material: 'enemy-simple10-mt',
        particle: null
    },
    simple25: {
        level: 2,
        points: 25,
        lifes: 1,
        material: 'enemy-simple25-mt',
        particle: null
    },
    simple50: {
        level: 3,
        points: 50,
        lifes: 3,
        material: 'enemy-simple50-mt',
        particle: null
    },
    parts: {
        level: 0,
        points: 0,
        lifes: 0,
        material: 'enemy-parts-mt',
        particle: null
    }
}

export function enemy(name: string, type: string, position: Vector3, parent: TransformNode) {
    const enemy = physicsEnemyFromModel(name, { size: GameState.state.sizes.enemy, position: position }, parent);

    resetEnemy(enemy, ENEMYTYPES[type])

    return enemy;
}
export function createEnemyMaterial(scene: Scene) {
    const pbr10 = new PBRMaterial("enemy-simple10-mt", GameState.scene());
    pbr10.roughness = 0.9;
    pbr10.metallic = 0.05;
    pbr10.albedoColor = new Color3(0.1, 0.1, 0.9);
    pbr10.anisotropy.isEnabled = true;
    pbr10.anisotropy.intensity = 0.5;
    pbr10.anisotropy.direction.x = 0.5;
    pbr10.anisotropy.direction.y = 0.5;
    //------------------------------------------
    pbr10.sheen.isEnabled = true;
    pbr10.sheen.intensity = 0.9;
    pbr10.sheen.color = new Color3(0.9, 0.3, 0.1);

    const pbr25 = new PBRMaterial("enemy-simple25-mt", GameState.scene());
    pbr25.roughness = 0.9;
    pbr25.metallic = 0.05;
    pbr25.albedoColor = new Color3(0.9, 0.1, 0.1);
    pbr25.anisotropy.isEnabled = true;
    pbr25.anisotropy.intensity = 0.5;
    pbr25.anisotropy.direction.x = 0.5;
    pbr25.anisotropy.direction.y = 0.5;
    //------------------------------------------
    pbr25.sheen.isEnabled = true;
    pbr25.sheen.intensity = 0.9;
    pbr25.sheen.color = new Color3(0.1, 0.9, 0.1);

    const pbr50 = new PBRMaterial("enemy-simple50-mt", GameState.scene());
    pbr50.roughness = 0.9;
    pbr50.metallic = 0.05;
    pbr50.albedoColor = new Color3(0.1, 0.9, 0.1);
    pbr50.anisotropy.isEnabled = true;
    pbr50.anisotropy.intensity = 0.5;
    pbr50.anisotropy.direction.x = 0.5;
    pbr50.anisotropy.direction.y = 0.5;
    //------------------------------------------
    pbr50.sheen.isEnabled = true;
    pbr50.sheen.intensity = 0.9;
    pbr50.sheen.color = new Color3(0.9, 0.3, 0.1);

    const pbrprt = new PBRMaterial("enemy-parts-mt", GameState.scene());
    pbrprt.roughness = 0.9;
    pbrprt.metallic = 0.05;
    pbrprt.albedoColor = new Color3(0.1, 0.05, 0.1);
    pbrprt.anisotropy.isEnabled = true;
    pbrprt.anisotropy.intensity = 0.5;
    pbrprt.anisotropy.direction.x = 0.5;
    pbrprt.anisotropy.direction.y = 0.5;
    //------------------------------------------
    pbrprt.sheen.isEnabled = true;
    pbrprt.sheen.intensity = 1.9;
    pbrprt.sheen.color = new Color3(0.9, 0.3, 0.1);
    //------------------------------------------
    // pbr.subSurface.isRefractionEnabled = true;
    // pbr.subSurface.refractionIntensity = 0.8;
    // pbr.subSurface.indexOfRefraction = 1.5;
    // //--------------------------------------------
    // pbr.subSurface.isTranslucencyEnabled = true;
    // pbr.subSurface.translucencyIntensity = 0.8;
    // pbr.subSurface.isTranslucencyEnabled = true;
    // pbr.subSurface.tintColor = Color3.White();
    //-----------------------------------------
    // pbr.subSurface.isScatteringEnabled = true;
    // pbr.subSurface.scatteringDiffusionProfile = new Color3(0.75, 0.25, 0.2);
    //--------------------------------------
    // pbr.clearCoat.isEnabled = true;
    // pbr.clearCoat.intensity = 1.5;
    // pbr.clearCoat.isTintEnabled = true;
    // pbr.clearCoat.tintColor = Color3.Blue();
    // pbr.clearCoat.tintColorAtDistance = 1;
    // pbr.clearCoat.tintThickness = 1.5;
    // // //-------------------------------------------
    // pbr.clearCoat.isTintEnabled = true;
    // pbr.clearCoat.indexOfRefraction = 2;
    //----------------------------------------
    // pbr.iridescence.isEnabled = true;
    // pbr.iridescence.intensity = 0.9;
    // pbr.iridescence.indexOfRefraction = 1.3;
    // pbr.iridescence.minimumThickness = 100; // in nanometers
    // pbr.iridescence.maximumThickness = 400; // in nanometers
    //-------------------------------------------

}
export function addShadowToEnemy(generators: Array<ShadowGenerator>, name: string) {
    generators.forEach(generator => {
        generator.addShadowCaster(GameState.scene().getMeshByName(name), false);
    });
}
export function enemyCollideReaction(enemy: Mesh) {
    if (!reTypeEnemy(enemy)) {
        enemyDamageModelEffect(enemy);
    }
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
            resetEnemy(enemy, ENEMYTYPES.simple10)
            break;
        }
        case 3: {
            resetEnemy(enemy, ENEMYTYPES.simple25);
            break;
        }
    }
    return true;
}
function resetEnemy(enemy: Mesh, type: any) {
    if (enemy["meta"] && enemy["meta"].particle) {
        (enemy["meta"].particle as ParticleSystem).dispose();
    }
    enemy["meta"] = type;
    const material = getMaterialByEnemyType(enemy) as PBRMaterial;
    enemy.material = material;
    const color = material.albedoColor;

    const prt = appendParticles(`${enemy.name}-particle`, enemy, {
        color1: Color4.FromColor3(color, 0.5),
        color2: Color4.FromColor3(color, 0.5),
        color3: Color4.FromColor3(color, 0.5),
        capacity: 900, emitRate: 300, max_size: 0.2, updateSpeed: 0.01,
        emmitBox: new Vector3(0.9, 0.9, 0.9), lifeTime: 1, gravityY: 1.5
    }, GameState.scene());
    prt.start();

    enemy["meta"].particle = prt;
}
function physicsEnemyFromModel(name: string, options: { size: number, position: Vector3 }, parent: TransformNode) {
    const inst = ASSETS.containers3D.get("cristal") as AssetContainer;
    const inst_model = inst.instantiateModelsToScene((name) => name);

    const model = Mesh.MergeMeshes(inst_model.rootNodes[0].getChildMeshes(), true, false, null, false, false);
    model.scaling = new Vector3(0.6, 0.6, 0.6);
    model.position = options.position;
    model.parent = parent;
    model.name = name;

    appendPhysics(model, {
        mass: GameState.state.physicsMaterial.enemy.mass,
        shape_material: {
            restitution: GameState.state.physicsMaterial.enemy.restitution,
            friction: GameState.state.physicsMaterial.enemy.friction
        }
    });

    return model;
}
function appendPhysics(mesh: Mesh, options: {
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
    return physics;
}
const getMaterialByEnemyType = (mesh: Mesh): PBRMaterial => (GameState.scene() as Scene).getMaterialByName(mesh["meta"].material) as PBRMaterial ?? null

const getMaterialByName = (name: string): PBRMaterial => (GameState.scene() as Scene).getMaterialByName(name) as PBRMaterial ?? null;

function enemyDamageModelEffect(enemy: Mesh) {
    const instanceModel = ASSETS.containers3D.get("enemy_damage").
        instantiateModelsToScene((name: string) => `enemy-damage-${name}`, true);
    const tn = new TransformNode(`tn-enemies`, GameState.scene())//GameState.enemyNodes();
    GameState.damageNodes().push(tn);
    const childs = instanceModel.rootNodes[0].getChildMeshes();

    const material_enemy = getMaterialByEnemyType(enemy) as PBRMaterial
    const color_enemy = material_enemy.albedoColor;
    const material = getMaterialByName('enemy-parts-mt') as PBRMaterial;

    childs.forEach(m => {
        if (m instanceof Mesh) {
            m.material = material;
            m.setParent(tn);
            tn.position = enemy.position.clone();
            appendPhysics(m, {
                mass: 1, shape_material: {
                    restitution: 0.1, friction: 0.1
                }
            });
            const prt = appendParticles(`${m.name}-particle`, m, {
                color1: new Color4(0.5, 0.4, 0.0, 0.5),
                color2: Color4.FromColor3(color_enemy, 0.8),
                color3: new Color4(0.00, 0.00, 0.00, 0.7),
                capacity: 400, emitRate: 200, max_size: 0.4, updateSpeed: 0.05,
                emmitBox: new Vector3(0.3, 0.3, 0.3), lifeTime: 3, gravityY: 1
            }, GameState.scene());
            prt.start();
            //---------------------------------------
            setAndStartTimer({
                timeout: Scalar.RandomRange(3000, 7000),
                contextObservable: GameState.scene().onBeforeRenderObservable,
                onEnded: () => {
                    prt.stop();
                    m.dispose();
                }
            });
        }
    });
    gameObjectDispose(enemy);
}