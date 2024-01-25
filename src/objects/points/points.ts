import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";
import { Mesh, MeshBuilder, Scene, Vector3, Animation, StandardMaterial, DynamicTexture, Matrix, CanvasAlphaMode, AlphaState, Color3 } from "@babylonjs/core";

export function initPoints(scene: Scene) {
    const points = MeshBuilder.CreatePlane("points", { size: 1 }, scene);
    points.billboardMode = Mesh.BILLBOARDMODE_ALL;
    points.isVisible = false;
    return points;
}

export function newPoints(text: string, position: Vector3) {
    const points = GameState.points().clone();
    points.position = position.add(new Vector3(0, 1, 0));
    points.isVisible = true;

    const txt = new DynamicTexture("points-txt", { width: 40, height: 40 }, GameState.scene());
    txt.hasAlpha = true;
    const ctx = txt.getContext();
    const material = new StandardMaterial("points-mt", GameState.scene());

    material.diffuseTexture = txt;
    material.emissiveTexture = txt;
    points.material = material;
    ctx.drawImage(ASSETS.sprites.get('points10'), 0, 0, 256, 256, 0, 0, 40, 40);
    txt.update();
    animatePoints(points);
}
function animatePoints(points: Mesh) {
    const keys = [
        {
            frame: 0,
            value: points.position.y
        },
        {
            frame: 60,
            value: points.position.y + 5
        }
    ];
    const anim = new Animation("points-anim", 'position.y', 60, Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT, false);
    anim.setKeys(keys);
    points.animations.push(anim);
    GameState.scene().beginAnimation(points, 0, 120, false, 1, () => {
        points.dispose();
    })
}