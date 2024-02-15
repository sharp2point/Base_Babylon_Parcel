import { GameState } from "@/game_state/game_state";
import { Mesh, PhysicsViewer, Scene, Tools, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";

export function clampToBoxShieldPosition(position: Vector3, shield: TransformNode, amount: number) {
    try {
        const new_position = Vector3.Clamp(position,
            new Vector3(GameState.state.dragBox.left, shield.position.y, GameState.state.dragBox.down),
            new Vector3(GameState.state.dragBox.rigth, shield.position.y, GameState.state.dragBox.up));
        const old_position = shield.position;
        shield.position = Vector3.Lerp(old_position, new_position, amount);
    } catch (err) {
        //console.error("CLAMP ERROR")
    }
}
export function gameObjectDispose(enemy: Mesh) {
    enemy.isVisible = false;
    const physics = enemy.getPhysicsBody();
    if (physics) {
        physics.shape.dispose();
        physics.dispose();
    }
    enemy.dispose();
}
export function isAllEnemiesDie() {
    return (GameState.enemyNodes()).getChildren().length > 0 ? false : true;
}
export function disposeEnemies() {
    if (GameState.damageNodes().length > 0) {
        GameState.damageNodes().forEach(tn => {
            tn.getChildren().forEach(obj => {
                gameObjectDispose(obj as Mesh);
            })
        })
    }
    if (GameState.enemyNodes()?.getChildren() && GameState.enemyNodes().getChildren().length > 0) {
        GameState.enemyNodes().getChildren().forEach(obj => {
            gameObjectDispose(obj as Mesh);
        })
    }

    (GameState.scene() as Scene).getMeshesById("enemy-cube").forEach(m => {
        m.dispose();
    })
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