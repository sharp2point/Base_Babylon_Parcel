import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";
import { Texture, Mesh, PhysicsViewer, Scalar, Scene, Tools, TransformNode, UniversalCamera, Vector3, StandardMaterial, Color3, PBRMaterial, MeshBuilder, AssetContainer } from "@babylonjs/core";

export function clampToBoxShieldPosition(position: Vector3, shield: TransformNode, amount: number) {
    try {
        const new_position = Vector3.Clamp(position,
            new Vector3(GameState.state.dragBox.left, shield.position.y, GameState.state.dragBox.down),
            new Vector3(GameState.state.dragBox.rigth, shield.position.y, GameState.state.dragBox.up))
            .add(new Vector3(0, 0, 0));
        const old_position = shield.position;
        shield.position = Vector3.Lerp(old_position, new_position, amount);
    } catch (err) {
        //console.error("CLAMP ERROR")
    }
}


export function debugPhysicsInfo(scene: Scene) {
    const pv = new PhysicsViewer();
    const ball = scene.getMeshByName("ball");
    const shield = scene.getMeshByName("shield");
    pv.showBody(ball.physicsBody);
    pv.showBody(shield.physicsBody);
    // for (const m of scene.rootNodes) {
    //     if (m instanceof Mesh) {
    //         if (m.physicsBody) {
    //             const dm = pv.showBody(m.physicsBody);
    //         }
    //     }
    // }
}
export function cameraSettings(aspect: number) {
    // console.log("AP: ", aspect);
    const camera = GameState.camera() as UniversalCamera;
    if (aspect < 0.45) {
        camera.position = new Vector3(0, 16.0, 0);
        camera.target = new Vector3(0, 0, 5);
        camera.fov = camera.fov = Tools.ToRadians(120);
    } else if (aspect >= 0.45 && aspect < 0.5) {
        camera.position = new Vector3(0, 15, 0);
        camera.target = new Vector3(0, 0, 5);
        camera.fov = camera.fov = Tools.ToRadians(115);
    } else if (aspect >= 0.5 && aspect < 0.55) {
        camera.position = new Vector3(0, 15, 0);
        camera.target = new Vector3(0, 0, 5);
        camera.fov = camera.fov = Tools.ToRadians(115);
    } else if (aspect >= 0.55 && aspect < 0.6) {
        camera.position = new Vector3(0, 14, 0);
        camera.target = new Vector3(0, 0, 5);
        camera.fov = camera.fov = Tools.ToRadians(115);
    } else if (aspect >= 0.6 && aspect < 0.65) {
        camera.position = new Vector3(0, 14, 0);
        camera.target = new Vector3(0, 0, 5);
        camera.fov = camera.fov = Tools.ToRadians(115);
    } else if (aspect >= 0.65 && aspect < 0.7) {
        camera.position = new Vector3(0, 13, 0);
        camera.target = new Vector3(0, 0, 4);
        camera.fov = camera.fov = Tools.ToRadians(115);
    } else if (aspect >= 0.7 && aspect < 0.75) {
        camera.position = new Vector3(0, 12, 0);
        camera.target = new Vector3(0, 0, 3);
        camera.fov = camera.fov = Tools.ToRadians(115);
    } else if (aspect >= 0.75 && aspect < 1) {
        camera.position = new Vector3(0, 12, -2);
        camera.target = new Vector3(0, 0, 2);
        camera.fov = Tools.ToRadians(110);
    } else if (aspect >= 1) {
        camera.position = new Vector3(0, 15, -10);
        camera.target = Vector3.Zero();
        camera.fov = Tools.ToRadians(80);
    }
}
export function randomInt(min: number, max: number) {
    return Math.trunc(Scalar.RandomRange(min, max));
}

// DISPOSE
export function gameObjectDispose(enemy: Mesh) {
    enemy.isVisible = false;
    const physics = enemy.getPhysicsBody();
    if (physics) {
        physics.shape.dispose();
        physics.dispose();
    }
    enemy.getChildMeshes().forEach((el: Mesh) => {
        if (el.name.includes("bonus")) {
            el.parent = null;
            el.position = enemy.absolutePosition.clone();
            el["meta"].action(el);
        }
    });
    enemy.dispose();
}
export function clearScene() {
    disposeRoots();
    disposeEnemies();
    disposeBonus();
    disposeEffects();
}
function disposeRoots() {
    const roots = GameState.scene().getMeshesById("Clone of __root__.__root__");
    roots.forEach((r) => {
        r.dispose();
    })
    const tn = GameState.scene().getMeshesById("tn-enemies");
    tn.forEach((r) => {
        r.dispose();
    });
    if (GameState.state.gameObjects.enemyNodes) {
        GameState.state.gameObjects.enemyNodes.dispose();
    }
}
function disposeEnemies() {
    if (GameState.damageNodes().length > 0) {
        GameState.damageNodes().forEach(tn => {
            tn.getChildren().forEach(obj => {
                gameObjectDispose(obj as Mesh);
            })
        })
    }
    if (GameState.EnemyNode()?.getChildren() && GameState.EnemyNode().getChildren().length > 0) {
        GameState.EnemyNode().getChildren().forEach(obj => {
            gameObjectDispose(obj as Mesh);
        })
    }

    (GameState.scene() as Scene).getMeshesById("enemy-cube").forEach(m => {
        m.dispose();
    })
}
function disposeBonus() {
    GameState.Bonuses().forEach((bonus: Mesh) => {
        if (bonus instanceof Mesh) {
            bonus.dispose();
        }
    })
}
function disposeEffects() {
    GameState.Effects().forEach((effect: Mesh) => {
        if (effect instanceof Mesh) {
            effect.dispose();
        }
    })
}
// END GAME LEVEL

function isAllEnemiesDie() {
    return (GameState.EnemyNode()).getChildren().length > 0 ? false : true;
}
export function isLEVEL_WIN() {
    if (isAllEnemiesDie()) {
        if (GameState.state.gameState !== GameState.state.signals.LEVEL_WIN) {
            GameState.changeGameState(GameState.state.signals.LEVEL_WIN);
        }
        GameState.state.enemyLight.setEnabled(false);
        GameState.state.enemyLight.intensity = 0;
    }
}
//MATERIALS --------------------
export function initMaterials(scene: Scene) {
    createEnemyMaterial(scene);
    preloadBonusMaterial(scene);
    initTextures(scene);
}
function preloadBonusMaterial(scene: Scene) {
    materialCreator("bomb", "public/sprites/bomb.png", scene);
    materialCreator("rocket", "public/sprites/rocket.png", scene);
    materialCreator("coin", "public/sprites/coin_star.png", scene);
    materialCreator("time", "public/sprites/clear_time.png", scene);
}
function materialCreator(type: string, texturePath: string, scene: Scene) {
    const texture = new Texture(texturePath, scene);
    texture.hasAlpha = true;
    const material = new StandardMaterial(`bonus-${type}-mt`, scene);
    material.diffuseTexture = texture;
    material.emissiveTexture = texture;
    material.backFaceCulling = false;
    material.alpha = 1;
}
function createEnemyMaterial(scene: Scene) {
    const pbr10 = new PBRMaterial("enemy-simple10-mt", GameState.scene());
    pbr10.alpha = 0.8;
    pbr10.roughness = 0.8;
    pbr10.metallic = 0.1;
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
    pbr10.alpha = 0.8;
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
    pbr10.alpha = 0.8;
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
    pbrprt.albedoColor = new Color3(0.4, 0.2, 0.4);
    pbrprt.anisotropy.isEnabled = true;
    pbrprt.anisotropy.intensity = 0.5;
    pbrprt.anisotropy.direction.x = 0.5;
    pbrprt.anisotropy.direction.y = 0.5;
    //------------------------------------------
    pbrprt.sheen.isEnabled = true;
    pbrprt.sheen.intensity = 1.9;
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
function initTextures(scene: Scene) {
    const rocketPartickeTexture = new Texture("public/sprites/magic_02.png", scene);
    rocketPartickeTexture.name = "rocket-txt";

}
//bonus plane
export function initModels(scene: Scene) {
    initEnemyModel(scene);
    initBonusPlane(scene);
    initDamageEnemyModel(scene);
}
function initBonusPlane(scene: Scene) {
    const plane = MeshBuilder.CreatePlane(`bonus-plane`, { size: 1.5 }, scene) as Mesh;
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    plane.isEnabled(false);
    plane.isVisible = false;
    GameState.state.gameObjects.bonus = plane;
}
function initEnemyModel(scene: Scene) {
    const inst = ASSETS.containers3D.get("cristal") as AssetContainer;
    const inst_model = inst.instantiateModelsToScene((name) => name);
    const model = Mesh.MergeMeshes(inst_model.rootNodes[0].getChildMeshes(), true, false, null, false, false);
    model.isEnabled(false);
    model.isVisible = false;
    GameState.state.gameObjects.enemy = model;
}
function initDamageEnemyModel(scene: Scene) {
    // const asset = ASSETS.containers3D.get("enemy_damage") as AssetContainer;
    // const inst = asset.instantiateModelsToScene((name: string) => `enemy-damage-${name}`, true);
    // const meshes = inst.rootNodes[0].getChildMeshes();
    // GameState.state.gameObjects.enemyDamage = meshes as Array<Mesh>;
}