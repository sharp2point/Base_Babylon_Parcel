import { GameState } from "@/game_state/game_state";
import { PhysicsViewer, Scene, TransformNode, Vector3 } from "@babylonjs/core";

export function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function clampToBoxShieldPosition(position: Vector3, shield: TransformNode, deltaPic: Vector3) {
    try {
        const new_position = Vector3.Clamp(position,
            new Vector3(GameState.dragBox.left, shield.position.y, GameState.dragBox.down),
            new Vector3(GameState.dragBox.rigth, shield.position.y, GameState.dragBox.up));
        const old_position = shield.position;
        shield.position = Vector3.Lerp(old_position, new_position, 0.2);
    } catch (err) {
        console.error("CLAMP ERROR")
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