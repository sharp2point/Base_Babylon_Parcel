import {
    MeshBuilder, PhysicsBody, PhysicsMotionType,
    PhysicsShapeSphere, Scene, Vector3, Vector2,
    PhysicsShapeBox, Quaternion, PhysicsShapeConvexHull,
    Mesh,
    FreeCamera,
    AssetContainer,
    StandardMaterial,
    Color3,
    Texture,
    Animation, EasingFunction, ElasticEase, CubicEase, IEasingFunction, CircleEase, PhysicsShapeCapsule, DistanceConstraint, Tools,
} from "@babylonjs/core";
import { loadToAssetContainer, mergeMeshes, loadModel, instateMesh } from "./loaderGlbFiles";
import { SizeBox, StarId, FlySide } from "./game_in_types";


//--------------------- Exports Test Object ------------------//
export function createPhysicsSphereBody(scene: Scene) {
    //--------- TEST RIG SHAPE ------//
    const testShape = MeshBuilder.CreateSphere("testSphere", { diameter: 1 }, scene);
    testShape.position.y = 5;
    const testShapePhysicsBody = new PhysicsBody(testShape, PhysicsMotionType.DYNAMIC, false, scene);
    testShapePhysicsBody.setMassProperties({
        mass: 0.01,
    });
    const collisionTestShape = new PhysicsShapeSphere(Vector3.Zero(), 0.5, scene);
    collisionTestShape.material = {
        restitution: 0.5,
        friction: 0.1,
    };
    testShapePhysicsBody.shape = collisionTestShape;

}
export function createStarBox(scene: Scene, size: SizeBox) {
    const starBox = MeshBuilder.CreateBox("starBox", { width: size.width, height: size.height, depth: size.dept }, scene);
    const material = new StandardMaterial("starBoxMaterial", scene);
    material.diffuseColor = new Color3(0, 0, 0);
    material.alpha = 0;
    starBox.material = material;


    const keys = [
        {
            frame: 0,
            value: 0
        },
        {
            frame: 30,
            value: 359
        }
    ]
    const animation = new Animation("starBoxAnimation", "rotation.y", 0.005, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    animation.setKeys(keys);
    starBox.animations.push(animation);
    scene.beginAnimation(starBox, 0, 30, true);
    return starBox;
}
export function createStar(starId: StarId, diameter: number, scene: Scene) {
    const star = MeshBuilder.CreateSphere(`${starId.name}-${starId.id}`, { diameter: diameter }, scene);
    const material = new StandardMaterial("starMaterial", scene);
    material.diffuseColor = Color3.Yellow();
    material.specularColor = new Color3(0.1, 0.1, 0.1);
    material.emissiveTexture = new Texture('public/textures/star_emmisive.png');
    //material.emissiveColor = new Color3(0.7, 0.7, 0.05);
    material.ambientColor = new Color3(1, 1, 1);
    star.material = material;

    const keys = [
        {
            frame: 0,
            value: new Color3(0.7, 0.7, 0.05)
        },
        {
            frame: 60,
            value: new Color3(1, 1, 1)
        },
        {
            frame: 120,
            value: new Color3(0.7, 0.7, 0.05)
        },
    ]
    const animation = new Animation('splashStar', "material.diffuseColor", 30, Animation.ANIMATIONTYPE_COLOR3, Animation.ANIMATIONLOOPMODE_CYCLE);
    animation.setKeys(keys);
    // const easing = new CircleEase();
    // easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    // animation.setEasingFunction(easing);

    // star.animations.push(animation);
    // scene.beginAnimation(star, 0, 120, true);
    return star;
}
//-------------------- Export Game Object -------------------//
export function createGround(scene: Scene, gameEnvSize: Vector2) {
    //--------- Ground ------------//
    const ground = MeshBuilder.CreateGround("ground", { width: gameEnvSize.x, height: gameEnvSize.y }, scene);
    ground.position = Vector3.Zero();
    const material = new StandardMaterial("groundMaterial", scene);
    material.diffuseColor = new Color3(0.1, 0.1, 0.2);
    ground.material = material;
    const groundPhysicsBody = new PhysicsBody(ground, PhysicsMotionType.STATIC, false, scene);
    const groundCollisionShape = new PhysicsShapeBox(Vector3.Zero(), new Quaternion(0, 0, 0, 1), new Vector3(50, 0.5, 50), scene);
    groundPhysicsBody.shape = groundCollisionShape;
}

export async function createModelGLB(scene: Scene) {
    //--------- Zont ------------//
    const container = await loadModel("public/models/", "zont_mp.glb", scene);
    const mesh = instateMesh("Zont", container as AssetContainer);
    mesh.scaling = new Vector3(2, 2.2, 2);
    mesh.position = new Vector3(0, 0, 0);
    const physicsBody = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, scene);
    physicsBody.setMassProperties({
        mass: 0.1,
        centerOfMass: new Vector3(0, 5, 0),
        inertia: new Vector3(0, 0, 0),
        inertiaOrientation: Quaternion.Identity(),
    });
    const physicShape = new PhysicsShapeConvexHull(mesh, scene);
    physicShape.material = {
        restitution: 0.5,
        friction: 0.1,
    };
    physicsBody.shape = physicShape;
    return {
        mesh: mesh,
        body: physicsBody,
    }
}