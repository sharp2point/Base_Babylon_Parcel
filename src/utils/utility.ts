import { GameState } from "@/game_state/game_state";
import { TransformNode, Vector3 } from "@babylonjs/core";

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