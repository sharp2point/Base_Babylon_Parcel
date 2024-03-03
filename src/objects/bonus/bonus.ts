import { GameState } from "@/game_state/game_state";
import {
    MeshBuilder, Scene, StandardMaterial,
    Texture, Tools, Animation, Mesh
} from "@babylonjs/core";

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
    console.log("Bomb Action Run:", bonus["meta"].payload)
}
function rocketAction(bonus: Mesh) {
    actionAnimation(bonus);
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
    const anim = new Animation(`bonus-anim`, "position.y", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT, false);
    anim.setKeys(keys);
    bonus.animations.push(anim);

    const keysr = [
        { frame: 0, value: 0 },
        { frame: 120, value: Tools.ToRadians(360) },
    ];
    const animr = new Animation(`bonus-anim`, "rotation.y", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT, false);
    animr.setKeys(keysr);
    bonus.animations.push(animr);

    GameState.scene().beginAnimation(bonus, 0, 120, false, 3, () => {
        bonus.dispose();
    })
}