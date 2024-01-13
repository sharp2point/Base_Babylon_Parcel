import { GameState } from "@/game_state/game_state";
import { Color3, MeshBuilder, PhysicsBody, PhysicsMotionType, PhysicsShapeConvexHull, ShadowGenerator, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";

export function enemy(name: string, position: Vector3, parent: TransformNode) {
    const enemy = physicsEnemy(name, { size: GameState.state.sizes.enemy, position: position }, parent);
    return enemy;
}
function physicsEnemy(name: string, options: { size: number, position: Vector3 }, parent: TransformNode) {
    const enemy = MeshBuilder.CreateBox(name, { size: options.size, updatable: true }, GameState.state.gameObjects.scene);
    enemy.parent = parent;
    enemy.position = options.position;
    const material = new StandardMaterial("enemy-material", GameState.state.gameObjects.scene);
    material.diffuseColor = new Color3(0.1, 0.5, 0.3);
    enemy.material = material;
    const physics = new PhysicsBody(enemy, PhysicsMotionType.DYNAMIC, false, GameState.state.gameObjects.scene);
    physics.setMassProperties({ mass: GameState.state.physicsMaterial.enemy.mass });
    const shape = new PhysicsShapeConvexHull(enemy, GameState.state.gameObjects.scene);
    shape.material = {
        restitution: GameState.state.physicsMaterial.enemy.restitution,
        friction: GameState.state.physicsMaterial.enemy.friction
    };
    physics.shape = shape;
    return enemy;
}
export function addShadowToEnemy(generator: ShadowGenerator, name: string) {
    generator.addShadowCaster(GameState.state.gameObjects.scene.getMeshByName(name), false);
}