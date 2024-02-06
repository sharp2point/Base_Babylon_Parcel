import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";
import { gameObjectDispose } from "@/utils/utility";
import { AssetContainer, Color3, Color4, HighlightLayer, Mesh, MeshBuilder, PBRBaseMaterial, PBRMaterial, ParticleSystem, PhysicsBody, PhysicsHelper, PhysicsMotionType, PhysicsRadialImpulseFalloff, PhysicsShapeConvexHull, PointColor, PointLight, Scalar, Scene, ShadowGenerator, SolidParticle, SolidParticleSystem, StandardMaterial, Texture, TransformNode, Vector3 } from "@babylonjs/core";

export function enemy(name: string, position: Vector3, parent: TransformNode) {
    // const enemy = physicsEnemy(name, { size: GameState.state.sizes.enemy, position: position }, parent);
    const enemy = physicsEnemyFromModel(name, { size: GameState.state.sizes.enemy, position: position }, parent);
    enemy["meta"] = {
        level: 1,
        points: 10
    }
    const prt = appendParticles(enemy, {
        color1: new Color4(0.1, 0.5, 0.9, 0.5),
        color2: new Color4(0.1, 0.2, 0.9, 0.5),
        color3: new Color4(0.1, 0.2, 0.9, 0.5),
        capacity: 900, emitRate: 300, max_size: 0.2, updateSpeed: 0.01,
        emmitBox: new Vector3(0.9, 0.9, 0.9), lifeTime: 1, gravityY: 1.5
    }, GameState.scene());
    prt.start();
    return enemy;
}

function physicsEnemyFromModel(name: string, options: { size: number, position: Vector3 }, parent: TransformNode) {

    const inst = ASSETS.containers3D.get("cristal") as AssetContainer;
    const inst_model = inst.instantiateModelsToScene((name) => name);

    const model = Mesh.MergeMeshes(inst_model.rootNodes[0].getChildMeshes(), true, false, null, false, false);
    model.scaling = new Vector3(0.6, 0.6, 0.6);
    model.position = options.position;
    model.parent = parent;
    model.name = name;

    const physics = new PhysicsBody(model, PhysicsMotionType.DYNAMIC, false, GameState.scene());
    physics.setMassProperties({ mass: GameState.state.physicsMaterial.enemy.mass });
    const shape = new PhysicsShapeConvexHull(model, GameState.scene());
    shape.material = {
        restitution: GameState.state.physicsMaterial.enemy.restitution,
        friction: GameState.state.physicsMaterial.enemy.friction
    };
    physics.shape = shape;
    appendMaterial(model, GameState.scene())
    return model;
}
function appendMaterial(mesh: Mesh, scene: Scene) {
    mesh.material = (GameState.scene() as Scene).getMaterialByName("enemy-cristal-mt");
}
export function createEnemyMaterial(scene: Scene) {
    const pbr = new PBRMaterial("enemy-cristal-mt", GameState.scene());
    pbr.roughness = 0.9;
    pbr.metallic = 0.05;
    pbr.albedoColor = new Color3(0.1, 0.1, 0.7);
}
export function addShadowToEnemy(generators: Array<ShadowGenerator>, name: string) {
    generators.forEach(generator => {
        generator.addShadowCaster(GameState.scene().getMeshByName(name), false);
    });
}
export function enemyCollideReaction(enemy: Mesh) {
    enemyDamageModelEffect(enemy)
}
function enemyDamageModelEffect(enemy: Mesh) {
    const instanceModel = ASSETS.containers3D.get("enemy_damage").
        instantiateModelsToScene((name: string) => `enemy-damage-${name}`, true);
    const tn = new TransformNode(`tn-enemies`, GameState.scene())//GameState.enemyNodes();
    GameState.damageNodes().push(tn);
    const childs = instanceModel.rootNodes[0].getChildMeshes();

    childs.forEach(m => {
        appendMaterial(m, GameState.scene());
        m.setParent(tn);

        tn.position = enemy.position.clone();
        const phy = new PhysicsBody(m, PhysicsMotionType.DYNAMIC, false, GameState.scene());
        phy.setMassProperties({ mass: 1 });
        const shape = new PhysicsShapeConvexHull(m as Mesh, GameState.scene());
        shape.material = { restitution: 0.1, friction: 0.1 };
        phy.shape = shape;
        const prt = appendParticles(m, {
            color1: new Color4(0.1, 0.1, 0.5, 0.2),
            color2: new Color4(0.2, 0.1, 0.7, 0.2),
            color3: new Color4(0.01, 0.01, 0.1, 0.2),
            capacity: 600, emitRate: 300, max_size: 0.9, updateSpeed: 0.05,
            emmitBox: new Vector3(0.3, 0.3, 0.3), lifeTime: 1, gravityY: 2
        }, GameState.scene());
        prt.start();
    });
    gameObjectDispose(enemy);
}

function appendParticles(mesh: Mesh, options: {
    color1: Color4, color2: Color4, color3: Color4,
    capacity: number, emitRate: number, max_size: number, updateSpeed: number,
    emmitBox: Vector3, lifeTime: number, gravityY: number
}, scene: Scene) {
    const prt = new ParticleSystem("ball-particle", 300, scene);
    prt.emitter = mesh;
    prt.particleTexture = new Texture("public/sprites/dirt_02.png");
    prt.maxEmitPower = 0.3;
    prt.minEmitPower = 0.1;
    prt.emitRate = options.emitRate;
    prt.color1 = options.color1;
    prt.color2 = options.color2;
    prt.colorDead = options.color3;
    prt.maxLifeTime = options.lifeTime;
    prt.minLifeTime = 0.1;
    prt.minAngularSpeed = 1;
    prt.maxSize = options.max_size;
    prt.minSize = 0.1;
    prt.maxEmitBox = options.emmitBox;
    prt.minEmitBox = options.emmitBox.multiply(new Vector3(-1, -1, -1));
    prt.updateSpeed = options.updateSpeed;
    prt.direction1 = new Vector3(0, 1, 0);
    prt.direction2 = new Vector3(0, 1, 0);
    prt.gravity = new Vector3(0, options.gravityY, 0);
    prt.disposeOnStop = true;
    return prt;
}
