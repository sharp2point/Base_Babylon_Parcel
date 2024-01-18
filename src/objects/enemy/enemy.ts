import { GameState } from "@/game_state/game_state";
import { gameObjectDispose } from "@/utils/utility";
import { Color3, Color4, HighlightLayer, Mesh, MeshBuilder, PhysicsBody, PhysicsHelper, PhysicsMotionType, PhysicsRadialImpulseFalloff, PhysicsShapeConvexHull, Scalar, Scene, ShadowGenerator, SolidParticle, SolidParticleSystem, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";

export function enemy(name: string, position: Vector3, parent: TransformNode) {
    const enemy = physicsEnemy(name, { size: GameState.state.sizes.enemy, position: position }, parent);
    enemy["meta"] = {
        level: 1,
        points: 10
    }
    return enemy;
}
function physicsEnemy(name: string, options: { size: number, position: Vector3 }, parent: TransformNode) {
    const enemy = MeshBuilder.CreateBox(name, { size: options.size, updatable: true }, GameState.scene());    
    enemy.position = options.position;
    enemy.parent = parent;
    const material = new StandardMaterial("enemy-material", GameState.scene());
    material.diffuseColor = new Color3(0.1, 0.5, 0.3);
    enemy.material = material;
    const physics = new PhysicsBody(enemy, PhysicsMotionType.DYNAMIC, false, GameState.scene());
    physics.setMassProperties({ mass: GameState.state.physicsMaterial.enemy.mass });
    const shape = new PhysicsShapeConvexHull(enemy, GameState.scene());
    shape.material = {
        restitution: GameState.state.physicsMaterial.enemy.restitution,
        friction: GameState.state.physicsMaterial.enemy.friction
    };
    physics.shape = shape;
    return enemy;
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
    const instanceModel = GameState.state.assets.containers3D.get("enemy_damage").
        instantiateModelsToScene((name: string) => `enemy-damage-${name}`, true);
    const tn = new TransformNode(`tn-enemies`, GameState.scene())//GameState.enemyNodes();
    GameState.damageNodes().push(tn);
    const childs = instanceModel.rootNodes[0].getChildMeshes();
    childs.forEach(m => {
        m.setParent(tn);
        tn.position = enemy.position.clone();
        const phy = new PhysicsBody(m, PhysicsMotionType.DYNAMIC, false, GameState.scene());
        phy.setMassProperties({ mass: 1 });
        const shape = new PhysicsShapeConvexHull(m as Mesh, GameState.scene());
        shape.material = { restitution: 0.1, friction: 0.1 };
        phy.shape = shape;
    });
    gameObjectDispose(enemy);
}
