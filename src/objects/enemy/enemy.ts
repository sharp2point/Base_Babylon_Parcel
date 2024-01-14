import { GameState } from "@/game_state/game_state";
import { Color3, Color4, HighlightLayer, Mesh, MeshBuilder, PhysicsBody, PhysicsHelper, PhysicsMotionType, PhysicsRadialImpulseFalloff, PhysicsShapeConvexHull, Scalar, Scene, ShadowGenerator, SolidParticle, SolidParticleSystem, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { materialize } from "rxjs";

export function enemy(name: string, position: Vector3, parent: TransformNode) {
    const enemy = physicsEnemy(name, { size: GameState.state.sizes.enemy, position: position }, parent);
    return enemy;
}
function physicsEnemy(name: string, options: { size: number, position: Vector3 }, parent: TransformNode) {
    const enemy = MeshBuilder.CreateBox(name, { size: options.size, updatable: true }, GameState.state.gameObjects.scene);

    enemy.position = options.position;
    //enemy.parent = parent;
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
export function addShadowToEnemy(generators: Array<ShadowGenerator>, name: string) {
    generators.forEach(generator => {
        generator.addShadowCaster(GameState.state.gameObjects.scene.getMeshByName(name), false);
    });
}
export function enemyCollideReaction(enemy: Mesh) {
    enemyDamageModelEffect(enemy)
}
function enemyDamageEffect(enemy: Mesh) {
    const sps = new SolidParticleSystem("sps-enemy-damage", GameState.state.gameObjects.scene, { useModelMaterial: true });
    const sphere = MeshBuilder.CreatePolyhedron("p", { type: 2 }, GameState.state.gameObjects.scene);
    sphere.scaling = new Vector3(0.1, 0.1, 0.1);
    const mat = new StandardMaterial("sps-mt", GameState.state.gameObjects.scene);
    mat.emissiveColor = Color3.Green();
    sphere.material = mat;
    sps.addShape(sphere, 10);
    sphere.dispose();
    const mesh = sps.buildMesh();
    const hl = new HighlightLayer("hl-enemy-sps", GameState.state.gameObjects.scene);

    const recycleParticle = (p: SolidParticle) => {
        const speed = 2;
        p.scaling = new Vector3(0.1, 0.1, 0.1);
        p.position = new Vector3(
            Scalar.RandomRange(enemy.position.x + 0.5, enemy.position.x - 0.5),
            Scalar.RandomRange(enemy.position.y + 0.3, enemy.position.y - 0.3),
            Scalar.RandomRange(enemy.position.z + 0.5, enemy.position.z - 0.5),
        );
        //p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
        p.velocity.x = Scalar.RandomRange(-1 * speed, 1 * speed);
        p.velocity.y = Scalar.RandomRange(0.01 * speed, 0.05 * speed);
        p.velocity.z = Scalar.RandomRange(-1 * speed, 1 * speed);
    }
    sps.initParticles = () => {
        sps.particles.forEach(p => {
            recycleParticle(p);
        })
    }
    sps.initParticles();
    sps.setParticles();

    sps.updateParticle = (p: SolidParticle) => {
        if (p.position.y < 0) {
            recycleParticle(p);
        }
        p.velocity.y -= 0.03;                  // apply gravity to y
        p.position.addInPlace(p.velocity); // update particle new position

        const direction = Math.sign(p.idx % 2 - 0.5); //rotation direction +/- 1 depends on particle index in particles array           // rotation sign and new value
        p.rotation.z += 0.01 * direction;
        p.rotation.x += 0.01 * direction;
        p.rotation.y += 0.01 * direction;
        return p;
    }

    const hndl = (GameState.state.gameObjects.scene as Scene).onAfterRenderObservable.add(() => {
        if (sps) {
            sps.setParticles();
            sps.mesh.rotation.y += 0.01;
        }
    });
    setTimeout(() => {
        hndl.remove();
        sps.dispose();
    }, 1000);
}
function enemyDamageModelEffect(enemy: Mesh) {
    const instanceModel = GameState.state.assets.containers3D.get("enemy_damage").
        instantiateModelsToScene((name: string) => `enemy-damage-${name}`, true);

    const ph = GameState.state.physicsHelper() as PhysicsHelper;
    const tn = new TransformNode("enemy-damage-tn", GameState.state.scene());
    instanceModel.rootNodes[0]
    const childs = instanceModel.rootNodes[0].getChildMeshes();
    childs.forEach(m => {
        m.setParent(tn);
        tn.position = enemy.position.clone();
        const phy = new PhysicsBody(m, PhysicsMotionType.DYNAMIC, false, GameState.state.scene());
        phy.setMassProperties({ mass: 1 });
        const shape = new PhysicsShapeConvexHull(m as Mesh, GameState.state.scene());
        shape.material = { restitution: 0.1, friction: 0.1 };
        phy.shape = shape;
    });
    enemyDispose(enemy);
}
function enemyDispose(enemy: Mesh) {
    enemy.isVisible = false;
    const physics = enemy.getPhysicsBody();
    if (physics) {
        physics.shape.dispose();
        physics.dispose();
    }
    enemy.dispose();
}