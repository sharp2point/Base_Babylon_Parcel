import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";
import { gameObjectDispose } from "@/utils/utility";
import { AssetContainer, Color3, Color4, HighlightLayer, Mesh, MeshBuilder, PBRBaseMaterial, PBRMaterial, ParticleSystem, PhysicsBody, PhysicsHelper, PhysicsMotionType, PhysicsRadialImpulseFalloff, PhysicsShapeConvexHull, PointColor, PointLight, Scalar, Scene, ShadowGenerator, SolidParticle, SolidParticleSystem, StandardMaterial, Texture, TransformNode, Vector3 } from "@babylonjs/core";

export const ENEMYTYPES = {
    simple10: {
        level: 1,
        points: 10,
        lifes: 1,
        material: 'enemy-simple10-mt'
    },
    simple25: {
        level: 1,
        points: 25,
        lifes: 1,
        material: 'enemy-simple25-mt'
    },
    simple50: {
        level: 1,
        points: 50,
        lifes: 3,
        material: 'enemy-simple50-mt'
    },
    parts: {
        level: 0,
        points: 0,
        lifes: 0,
        material: 'enemy-parts-mt'
    }
}

export function enemy(name: string, type: string, position: Vector3, parent: TransformNode) {
    // const enemy = physicsEnemy(name, { size: GameState.state.sizes.enemy, position: position }, parent);
    console.log("ENEMY---->", type);
    const enemy = physicsEnemyFromModel(name, { size: GameState.state.sizes.enemy, position: position }, parent);


    switch (type) {
        case "simple10": {
            enemy["meta"] = ENEMYTYPES.simple10;
            console.log("ENEMY---->", enemy["meta"])
            break;
        }
        case "simple25": {
            enemy["meta"] = ENEMYTYPES.simple25;
            break;
        }
        case "simple50": {
            enemy["meta"] = ENEMYTYPES.simple50;
            break;
        }
    }
    appendMaterial(enemy)
    const material = getMaterialByEnemyType(enemy) as PBRMaterial;
    const color = material.albedoColor;
    const prt = appendParticles(enemy, {
        color1: Color4.FromColor3(color, 0.5),
        color2: Color4.FromColor3(color, 0.5),
        color3: Color4.FromColor3(color, 0.5),
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

    return model;
}
function getMaterialByEnemyType(mesh: Mesh) {
    return (GameState.scene() as Scene).getMaterialByName(mesh["meta"].material)
}
function getMaterialByName(name: string) {
    return (GameState.scene() as Scene).getMaterialByName(name)
}
function appendMaterial(mesh: Mesh) {
    mesh.material = getMaterialByEnemyType(mesh);
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
    pbrprt.sheen.intensity = 0.9;
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
    enemyDamageModelEffect(enemy)
}
function enemyDamageModelEffect(enemy: Mesh) {
    const instanceModel = ASSETS.containers3D.get("enemy_damage").
        instantiateModelsToScene((name: string) => `enemy-damage-${name}`, true);
    const tn = new TransformNode(`tn-enemies`, GameState.scene())//GameState.enemyNodes();
    GameState.damageNodes().push(tn);
    const childs = instanceModel.rootNodes[0].getChildMeshes();

    const material = getMaterialByName('enemy-parts-mt') as PBRMaterial;
    const color = material.albedoColor;

    childs.forEach(m => {
        m.material = material;
        m.setParent(tn);

        tn.position = enemy.position.clone();
        const phy = new PhysicsBody(m, PhysicsMotionType.DYNAMIC, false, GameState.scene());
        phy.setMassProperties({ mass: 1 });
        const shape = new PhysicsShapeConvexHull(m as Mesh, GameState.scene());
        shape.material = { restitution: 0.1, friction: 0.1 };
        phy.shape = shape;
        const prt = appendParticles(m, {
            color1: new Color4(0.1, 0.1, 0.1, 0.5),
            color2: Color4.FromColor3(color, 0.8),
            color3: new Color4(0.01, 0.01, 0.05, 0.7),
            capacity: 600, emitRate: 200, max_size: 0.5, updateSpeed: 0.05,
            emmitBox: new Vector3(0.3, 0.3, 0.3), lifeTime: 2, gravityY: 0.5
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
