import { GameState } from "@/game_state/game_state";
import {
    MeshBuilder, Scene, StandardMaterial,
    Texture, Tools, Animation, Mesh,
    Vector3
} from "@babylonjs/core";
import { bombEffect } from "./effects/bomb";
import { rocketEffect } from "./effects/rocket";

const BONUSTYPE = {
    100: {
        descript: "bomb",
        image: "public/sprites/bomb.png",
        payload: 0,
        action: bombAction,
    },
    200: {
        descript: "coin",
        image: "public/sprites/coin_star.png",
        payload: 0,
        action: coinAction,
    },
    300: {
        descript: "rocket",
        image: "public/sprites/rocket.png",
        payload: 0,
        action: rocketAction,
    },
    400: {
        descript: "time",
        image: "public/sprites/clear_time.png",
        payload: 0,
        action: timeAction,
    }
}

export function bonus(type: number, options: { payload: number }, scene: Scene) {
    const plane = MeshBuilder.CreatePlane(`bonus-${type}`, { size: 1 });
    const texture = new Texture(BONUSTYPE[type].image, scene);
    texture.hasAlpha = true;

    const material = new StandardMaterial(`bonus-${type}-mt`, scene);
    material.diffuseTexture = texture;
    material.emissiveTexture = texture;
    material.backFaceCulling = false;
    plane.material = material;
    // plane.rotation.x = Tools.ToRadians(90);
    const meta = BONUSTYPE[type];
    meta.payload = options.payload;
    plane["meta"] = BONUSTYPE[type];
    return plane;
}

function bombAction(bonus: Mesh) {
    actionAnimation(bonus);
    bombEffect(bonus.absolutePosition);
    console.log("Bomb Action Run:", bonus["meta"].payload)
}
function rocketAction(bonus: Mesh) {
    actionAnimation(bonus);
    rocketEffect(new Vector3(-5, 2, -20));
    rocketEffect(new Vector3(0, 2, -20));
    rocketEffect(new Vector3(5, 2, -20));
    console.log("Rocket Action Run", bonus["meta"].payload)
}
function timeAction(bonus: Mesh) {
    actionAnimation(bonus);
    console.log("Time Action Run", bonus["meta"].payload)
}
function coinAction(bonus: Mesh) {
    actionAnimation(bonus);
    console.log("Coin Action Run", bonus["meta"].payload)
}

function actionAnimation(bonus: Mesh) {
    const start = bonus.absolutePosition.y;
    const keys = [
        { frame: 0, value: start },
        { frame: 120, value: start + 10 },
    ];
    const anim = new Animation(`bonus-anim`, "position.y", 40, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT, false);
    anim.setKeys(keys);
    bonus.animations.push(anim);

    const keysr = [
        { frame: 0, value: 0 },
        { frame: 120, value: Tools.ToRadians(360) },
    ];
    const animr = new Animation(`bonus-anim`, "rotation.y", 40, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT, false);
    animr.setKeys(keysr);
    bonus.animations.push(animr);

    GameState.scene().beginAnimation(bonus, 0, 120, false, 2, () => {
        bonus.dispose();
    })
}