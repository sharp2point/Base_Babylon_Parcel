import { MeshBuilder, Scene, StandardMaterial, Texture, Tools } from "@babylonjs/core";
import { Mesh } from "pixi.js";

const BONUSTYPE = {
    100: {
        descript: "bomb",
        image: "public/sprites/bomb.png",
        action: bombAction,
    },
    200: {
        descript: "coin",
        image: "public/sprites/coin_star.png",
        action: coinAction,
    },
    300: {
        descript: "rocket",
        image: "public/sprites/rocket.png",
        action: rocketAction,
    },
    400: {
        descript: "time",
        image: "public/sprites/clear_time.png",
        action: timeAction,
    }
}

export function bonus(type: number, scene: Scene) {
    const plane = MeshBuilder.CreatePlane(`bonus-${type}`, { size: 1 });
    const texture = new Texture(BONUSTYPE[type].image, scene);
    texture.hasAlpha = true;
    const material = new StandardMaterial(`bonus-${type}-mt`, scene);
    material.diffuseTexture = texture;
    material.emissiveTexture = texture;
    plane.material = material;
    plane.rotation.x = Tools.ToRadians(90);
    plane["meta"] = BONUSTYPE[type];
    return plane;
}

function bombAction(bonus: Mesh) {
    console.log("Bomb Action Run")
}
function rocketAction(bonus: Mesh) {
    console.log("Rocket Action Run")
}
function timeAction(bonus: Mesh) {
    console.log("Time Action Run")
}
function coinAction(bonus: Mesh) {
    console.log("Coin Action Run")
}