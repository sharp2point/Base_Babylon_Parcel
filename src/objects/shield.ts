import { Color3, HavokPlugin, Mesh, MeshBuilder, PhysicsBody, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeConvexHull, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

export class Shield {
    private _name = "shield";
    private _control_mesh: Mesh = null;
    private _ball_pivot: Mesh = null;
    private _physics: PhysicsBody = null;
    private shild_size = {
        width: 3.5,
        height: 1,
        depth: 1
    }

    get name() {
        return this._name;
    }
    set position(val: Vector3) {
        this._control_mesh.position = val;
    }
    get position() {
        return this._control_mesh.position.clone()
    }
    get ball_pivot() {
        return this._ball_pivot;
    }
    //------------------------------------------------------>
    constructor(position: Vector3, scene: Scene) {

        this._physics = this.physicsBox(scene);
        //--------------------------------------------------------------------->
        this._control_mesh = this.shieldBox(this._control_mesh, position, scene);

        this._ball_pivot = this.ballPivot(this._control_mesh, scene);

        const shield_pivot = this.shieldPivot(this._control_mesh, new Vector3(0, 0.1, 0), scene);
        //--------------------------------------------------------------------->

        this._control_mesh.onBeforeRenderObservable.add(() => {
            globalThis.HVK.setPhysicsBodyTransformation(this._physics, shield_pivot);
        })
    }
    //------------------------------------------------------->
    physicsBox = (scene: Scene) => {
        const mesh = MeshBuilder.CreateBox(`${this._name}-physics-mesh`, {
            width: this.shild_size.width * 0.95,
            height: this.shild_size.height * 0.8,
            depth: this.shild_size.depth * 0.6
        }, scene);
        const material = new StandardMaterial(`${this._name}-material`, scene);
        material.diffuseColor = new Color3(0.3, 0.3, 0.3);
        material.alpha = 0.5;
        mesh.material = material;

        const physics = new PhysicsBody(mesh, PhysicsMotionType.STATIC, false, scene);
        physics.setMassProperties({ mass: 0 });
        const shape = new PhysicsShapeConvexHull(mesh, scene);
        shape.material = { restitution: 0, friction: 0 };
        physics.shape = shape;
        return physics
    }
    shieldBox = (mesh: Mesh, position: Vector3, scene: Scene): Mesh => {
        mesh = MeshBuilder.CreateBox(this._name, {
            width: this.shild_size.width,
            height: this.shild_size.height,
            depth: this.shild_size.depth * 1.5
        }, scene);
        mesh.position = position.add(new Vector3(0, this.shild_size.height / 2, 0));
        const material = new StandardMaterial("shield-box-material", scene);
        material.diffuseColor = new Color3(0.5, 0.3, 0.8);
        material.alpha = 0.01;
        mesh.material = material;
        mesh.isPickable = true;
        mesh.checkCollisions = false;
        return mesh;
    }
    ballPivot = (parent: Mesh, scene: Scene) => {
        const mesh = MeshBuilder.CreateBox("shield-box-ball-pivot", { width: 0.1, height: 0.1, depth: 0.1 }, scene);
        const material = new StandardMaterial("shield-box-pivot-material", scene);
        mesh.position = new Vector3(0, 0.6, 0.65);
        material.diffuseColor = new Color3(0.7, 0.1, 0.1);
        material.alpha = 0.5;
        mesh.material = material;
        mesh.parent = parent;
        mesh.checkCollisions = false;
        return mesh;
    }
    shieldPivot = (parent: Mesh, position: Vector3, scene: Scene) => {
        const mesh = MeshBuilder.CreateBox("shield-box-shield-pivot", { width: 0.1, height: 0.1, depth: 0.1 }, scene);
        const material = new StandardMaterial("shield-box-shield-pivot-material", scene);
        mesh.position = position;
        material.diffuseColor = new Color3(0.7, 0.1, 0.9);
        material.alpha = 0.5;
        mesh.material = material;
        mesh.parent = parent;
        mesh.checkCollisions = false;
        return mesh;
    }
}

