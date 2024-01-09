import { Color3, Color4, HavokPlugin, Mesh, MeshBuilder, Observable, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeConvexHull, PhysicsShapeType, Quaternion, Scene, ShadowGenerator, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Ball } from "./ball";
import { gmSize } from "@/game_types/types";

export class Shield {
    private _name = "shield";
    private _control_mesh: Mesh = null;
    private _mesh: Mesh = null;
    private _ball_pivot: Mesh = null;
    private _shield_pivot: Mesh = null;
    private _physics: PhysicsBody = null;
    private _shild_size: gmSize = null;
    private _testDeltaPos = null;
    private _deltaX = 0;
    private _deltaZ = 0;

    get mesh() {
        return this._mesh;
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
    get deltaXZ() {
        return {
            x: this._deltaX,
            z: this._deltaZ
        }
    }
    //------------------------------------------------------>
    constructor(size: gmSize, position: Vector3, scene: Scene) {
        this._shild_size = size;
        this._testDeltaPos = this.dragDeltaPos(10, Vector3.Zero());
        this._control_mesh = this.shieldBox(this._control_mesh, position, scene);
        this._control_mesh["positionObserver"] = new Observable();
        this._ball_pivot = this.ballPivot(this._control_mesh, scene);
        this._shield_pivot = this.shieldPivot(this._control_mesh, new Vector3(0, 0, 0), scene);
        this.physicsBox(scene);

        globalThis.HVK.setPhysicsBodyTransformation(this._physics, this._shield_pivot);
    }
    //------------------------------------------------------->
    private physicsBox = (scene: Scene) => {
        this._mesh = this._control_mesh.clone(`${this._name}-physics-mesh`, this._control_mesh);
        this._mesh.receiveShadows = true;
        this._mesh.parent = this._control_mesh;

        this._physics = new PhysicsBody(this._mesh, PhysicsMotionType.ANIMATED, false, scene);
        const shape = new PhysicsShapeConvexHull(this._mesh, scene);
        shape.material = { restitution: 1, friction: 0 };
        this._physics.shape = shape;
    }
    private shieldBox = (mesh: Mesh, position: Vector3, scene: Scene): Mesh => {
        mesh = MeshBuilder.CreateBox(this._name, {
            width: this._shild_size.width,
            height: this._shild_size.height,
            depth: this._shild_size.depth * 1.5
        }, scene);
        mesh.position = position.add(new Vector3(0, this._shild_size.height / 2, 0));
        const material = new StandardMaterial("shield-box-material", scene);
        material.diffuseColor = new Color3(0.5, 0.3, 0.3);
        material.alpha = 0.4;
        mesh.material = material;
        mesh.isPickable = true;
        return mesh;
    }
    private ballPivot = (parent: Mesh, scene: Scene) => {
        const mesh = MeshBuilder.CreateBox("shield-box-ball-pivot", { width: 0.1, height: 0.1, depth: 0.1 }, scene);
        const material = new StandardMaterial("shield-box-pivot-material", scene);
        mesh.position = new Vector3(0, 0.3, 0.7);
        material.diffuseColor = new Color3(0.7, 0.1, 0.1);
        material.alpha = 0.5;
        mesh.material = material;
        mesh.parent = parent;
        mesh.checkCollisions = false;
        return mesh;
    }
    private shieldPivot = (parent: Mesh, position: Vector3, scene: Scene) => {
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
    addShadow = (shadow_gen: ShadowGenerator) => {
        shadow_gen.addShadowCaster(this._mesh);
    }
    dragDeltaPos = (init_counter: number, init_position: Vector3) => {
        let counter = init_counter;
        let old_position = init_position;
        return (new_position: Vector3) => {
            if (counter <= 0) {
                this._deltaX = old_position.clone().x - new_position.x;
                this._deltaZ = old_position.clone().z - new_position.z;
                old_position = new_position;
                counter = init_counter;
            };
            counter -= 1;
        }
    }
    transformPhysicsShield = () => {
        globalThis.HVK.setPhysicsBodyTransformation(this._physics, this._shield_pivot);
    }
    transformBall = (ball: Ball) => {
        ball.position = this._control_mesh.position.add(this._ball_pivot.position).clone();
        globalThis.HVK.setPhysicsBodyTransformation(ball.physics, this._ball_pivot)
    }
    //--------------------- OBSERVERS ---------------------------------->
    addBallObservable = (ball: Ball) => {
        this._control_mesh["positionObserver"].add((pos: Vector3) => {
            this.transformPhysicsShield();
            if (!ball.isDynamic) {
                this.transformBall(ball);
            } else {
                testLine(pos);
            }
        })
    }
    onPositionObserver = () => {
        const pos = this._control_mesh.getAbsolutePosition().clone();
        this._testDeltaPos(pos);
        this._control_mesh["positionObserver"].notifyObservers(pos);
    }
}
//---------------------------------------->

function clearTestLine() {
    const line = globalThis.gameWorkScene.getMeshByName("test-line") as Mesh;
    if (line) {
        line.dispose();
    }
}
function testLine(position: Vector3) {
    clearTestLine();
    const line = MeshBuilder.CreateLines("test-line", {
        points: [new Vector3(-5, 0.1, position.z + 1), new Vector3(5, 0.1, position.z + 1)],
        colors: [new Color4(0.5, 0.5, 0.1, 1), new Color4(0.5, 0.5, 0.1, 1)]
    }, globalThis.gameWorkScene);
}

