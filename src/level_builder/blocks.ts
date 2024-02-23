import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";
import { MeshBuilder, Mesh, PhysicsBody, PhysicsMotionType, Tools, TransformNode, Vector3, PhysicsShapeConvexHull, CSG, Animation, AssetContainer, Space, PhysicsShapeMesh } from "@babylonjs/core";

export const BLOCKTYPES = {
    200: {

    }
}

export function staticBlock(name: string, options: { type: number, position: Vector3, angle: number }, parent: TransformNode) {
    const model = blockModel(`static-${name}`, { type: options.type, position: options.position, angle: options.angle }, parent);
    blockPhysics(model);

    return model;
}
export function animationComposeBlock(name: string, options: { type: number, position: Vector3 }, parent: TransformNode) {
    const model = composeModel(`static-${name}`, { type: options.type, position: options.position }, parent);
    const physics = blockShapeMeshPhysics(model);
    physics.setAngularVelocity(new Vector3(0, 0.5, 0))
    return model;
}
export function animationGLBBlock(name: string, options: { type: number, position: Vector3 }, parent: TransformNode) {
    const model = fromGLBModel(`static-${name}`, { type: options.type, position: options.position }, parent);
    const physics = blockShapeMeshPhysics(model);
    physics.setAngularVelocity(new Vector3(0, 0.5, 0))
    model.setParent(parent);
    return model;
}
//------------------------------------------------------
function blockModel(name: string, options: { type: number, position: Vector3, angle: number }, parent: TransformNode) {
    const model = MeshBuilder.CreateCylinder(name, { height: 0.8, diameter: 2.5, tessellation: 5, subdivisions: 3 });
    model.position = options.position;
    //model.rotation.y = Tools.ToRadians(options.angle);
    model.setParent(parent);
    return model;
}
function composeModel(name: string, options: { type: number, position: Vector3 }, parent: TransformNode) {
    const model = MeshBuilder.CreateCylinder(name, { height: 0.8, diameter: 5.5, tessellation: 5, subdivisions: 3 }, GameState.scene());
    const model2 = MeshBuilder.CreateCylinder(name, { height: 1, diameter: 4.5, tessellation: 5, subdivisions: 3 }, GameState.scene());
    const model3 = MeshBuilder.CreateBox(name, { width: 5, height: 1, depth: 2 }, GameState.scene());
    model3.rotation.y = Tools.ToRadians(33);
    model3.position = new Vector3(3, 0, -2.2)
    const csg1 = CSG.FromMesh(model);
    const csg2 = CSG.FromMesh(model2);
    const csg3 = CSG.FromMesh(model3);

    const compose = csg2.union(csg3);
    csg1.subtractInPlace(compose);

    model.dispose();
    model2.dispose();
    model3.dispose();
    GameState.scene().removeMesh(model);
    GameState.scene().removeMesh(model2);
    GameState.scene().removeMesh(model3);

    csg1.position = options.position.add(new Vector3(0, 0.3, 0));
    const m = csg1;

    return m.toMesh(name, null, GameState.scene(), false);
}
function fromGLBModel(name: string, options: { type: number, position: Vector3 }, parent: TransformNode) {
    const inst = ASSETS.containers3D.get("build_six") as AssetContainer;
    const inst_model = inst.instantiateModelsToScene((name) => name);

    const meshes = inst_model.rootNodes[0].getChildMeshes() as Array<Mesh>;

    const model = Mesh.MergeMeshes(meshes, true);

    model.rotation.x = Tools.ToRadians(90);
    model.scaling = new Vector3(0.6, 0.6, 1);
    model.position = options.position.add(new Vector3(0, 0.3, 0));

    return model;
}
//-----------------------------------------------------
function blockPhysics(block: Mesh) {
    const physics = new PhysicsBody(block, PhysicsMotionType.ANIMATED, false, GameState.scene());
    const shape = new PhysicsShapeConvexHull(block, GameState.scene());
    physics.shape = shape;
    return physics;
}
function blockShapeMeshPhysics(block: Mesh) {
    const physics = new PhysicsBody(block, PhysicsMotionType.ANIMATED, false, GameState.scene());
    const shape = new PhysicsShapeMesh(block, GameState.scene());
    physics.shape = shape;
    return physics;
}
function anim(tn: TransformNode) {
    const keys = [
        { frame: 0, value: 0 },
        { frame: 120, value: Tools.ToRadians(359) }
    ];
    const anim = new Animation("tn-anim", "rotation.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    anim.setKeys(keys);
    tn.animations.push(anim);
    GameState.scene().beginAnimation(tn, 0, 120, true, 1);

}