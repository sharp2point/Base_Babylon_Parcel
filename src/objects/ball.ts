import { randomInt } from "@/utils/utility";
import { Color3, Color4, IPhysicsCollisionEvent, Mesh, MeshBuilder, PhysicsBody, PhysicsMotionType, PhysicsShapeSphere, Scene, ShadowGenerator, StandardMaterial, Vector3 } from "@babylonjs/core";


export class Ball {
    private _mesh: Mesh = null;
    private _physics: PhysicsBody = null;
    isDynamic = false;

    get mesh() {
        return this._mesh;
    }
    get physics() {
        return this._physics
    }
    get ball() {
        return this._mesh;
    }
    get position() {
        return this._mesh.position.clone();
    }
    set position(val) {
        this._mesh.position = val;
    }
    //------------------------------------------------>
    constructor(size: number, position: Vector3, scene: Scene) {
        this._mesh = MeshBuilder.CreateSphere('ball', { diameter: size }, scene);
        this._mesh.position = position;

        const material = new StandardMaterial("ball-material", scene);
        material.diffuseColor = new Color3(0.3, 0.3, 0.4);
        material.maxSimultaneousLights = 10;
        this._mesh.material = material;
        this._physics = new PhysicsBody(this._mesh, PhysicsMotionType.ANIMATED, false, scene);
        this._physics.setMassProperties({
            mass: 100,
        });
        this._physics.setCollisionCallbackEnabled(true);
        this._physics.shape = new PhysicsShapeSphere(Vector3.Zero(), size * 0.5, scene);
    }
    //------------------------------------------------------------------------->
    addShadow = (shadow_gen: ShadowGenerator) => {
        shadow_gen.addShadowCaster(this._mesh, true);
    }
    getTypePhysics = () => this._physics.getMotionType();
    toDynamic = () => {
        if (this.getTypePhysics() === PhysicsMotionType.ANIMATED) {
            this._physics.setMotionType(PhysicsMotionType.DYNAMIC);
            this._physics.setCollisionCallbackEnabled(true);
            this._physics.setCollisionEndedCallbackEnabled(true);
            setTimeout(() => {
                this._physics.shape.material = { restitution: 1, friction: 0 }
                this._physics.applyImpulse(new Vector3(0, 0, 3000), Vector3.Zero());
                this.isDynamic = true;
            }, 500);
        }
    }
    //------------------------------------------------------------>
    clear = (position: Vector3, scene: Scene) => {
        globalThis.HVK.setMotionType(this._physics, PhysicsMotionType.ANIMATED);
        this._physics.setAngularVelocity(Vector3.Zero());
        this._physics.setLinearVelocity(Vector3.Zero());
        this._mesh.position = Vector3.Zero();
        globalThis.HVK.setPhysicsBodyTransformation(this._physics, this._mesh);
    }
    clearYPOS = () => {
        this._physics.setLinearVelocity(this._physics.getLinearVelocity().clone().multiply(new Vector3(1, 0, 1)));
    }
    //------------------------------------------------------------>
    onCollisionEndHandler(eventData: IPhysicsCollisionEvent, scene: Scene) {
        const enemy = eventData.collidedAgainst.transformNode;
        const cld = eventData.collider.transformNode;
        if (this.isDynamic) {
            if (cld.name.includes("shield")) {

                //this._physics.applyImpulse(this._physics.getLinearVelocity().scale(-1), Vector3.Zero())
                //this._physics.setLinearVelocity(this._physics.getLinearVelocity().scale(-1));
            }
            if (enemy.name.includes("border")) {
                const vec = this._physics.getLinearVelocity().multiply(new Vector3(1, 0, 1)).normalize();
                const pos = this._mesh.position;
                const dotZ = vec.dot(new Vector3(0, 0, 1));
                const dotX = vec.dot(new Vector3(1, 0, 0));
                const line = MeshBuilder.CreateLines("cld-line", {
                    points: [pos, pos.add(vec)],
                    colors: [new Color4(0.7, 0.1, 0.1, 1), new Color4(0.7, 0.1, 0.1, 1)]
                }, globalThis.gameWorkScene);

                //console.log("DOT: ", dot);
                const ang = this._physics.getAngularVelocity().clone().normalize();
                const lin = this._physics.getLinearVelocity().clone().normalize()
                switch (enemy.name) {
                    case "left-physics-border": {
                        if (dotZ > -0.02 && dotZ < 0.02) {
                            this._physics.setLinearVelocity(this._physics.getLinearVelocity().clone().add(new Vector3(0, 0, dotZ * 700)));
                        }
                        break;
                    }
                    case "right-physics-border": {
                        if (dotZ > -0.02 && dotZ < 0.02) {
                            this._physics.setLinearVelocity(this._physics.getLinearVelocity().clone().add(new Vector3(0, 0, dotZ * 700)));
                        }
                        break;
                    }
                    case "up-physics-border": {
                        if (dotX > -0.02 && dotX < 0.02) {
                            this._physics.setLinearVelocity(this._physics.getLinearVelocity().clone().add(new Vector3(dotX < 0 ? -2 : 2, 0, 0)));
                        }
                        break;
                    }
                }
            }
            //this._physics.setLinearVelocity(this._physics.getLinearVelocity().clone().scale(1.01));
        }
    }
    ballShieldReaction = () => {

        this._physics.setLinearVelocity(Vector3.Zero());
        this._physics.applyImpulse(new Vector3(0, 0, 3000), Vector3.Zero());
        //this._physics.setLinearVelocity(this._physics.getLinearVelocity().clone().scale(-1))
    }
}