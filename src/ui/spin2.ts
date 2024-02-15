import { ASSETS } from "@/game_state/assets/state";
import { GameState } from "@/game_state/game_state";
import { loadMenuItemModel } from "@/utils/loaderGlbFiles";
import {
    Color3, Mesh,
    Scene, StandardMaterial, Texture, Tools,
    Vector3, Animation,
    AssetContainer,
    TransformNode,
    IPointerEvent,
    PickingInfo,
    PointerEventTypes,
    Ray,
    RayHelper,
    Color4,
    ParticleSystem,
} from "@babylonjs/core";
import { FireProceduralTexture } from "@babylonjs/procedural-textures";
import { redrawLevelDescription, redrawResult, showDescription, showResult, showSpinMenuButtons } from "./html/ui_components";
import { getResultsIDB } from "@/DB/indexdb";
import { GameResult } from "@/DB/sheme";
import { UISTATE } from "@/game_state/ui/state";
import { appendParticles } from "@/utils/clear_utils";

const ITEM_MODELS = {
    border: null as Mesh,
    center: null,
    level: null,
    numbers: new Map<string, Mesh>()
}
export const SPINMENU = {
    nodeMenu: null,
    count: 6,
    radius: 14,
    position: new Vector3(0, 0, 15),
    angle: 0,
    angleDelta: 0,
    focusItem: null,
    items: new Map<number, TransformNode>(),
    scaleDeterminant: 0.6,
    scaleDeterminantMax: 1.5,
    isFocusItemHover: false,
    isLeaveMenu: true,
    hoverMaterial: null,
    standardMaterial: null,
    hoverParticles: null as ParticleSystem
}

export async function spinMenu2(scene: Scene) {
    let isPointerDown = false;
    let initPointDown: Vector3 = null;

    SPINMENU.standardMaterial = new StandardMaterial("standard-item-mt", scene);
    SPINMENU.standardMaterial.diffuse = new Color3(0.2, 0.2, 0.2);

    var fireTexture = new FireProceduralTexture("fireTex", 256, scene);
    SPINMENU.hoverMaterial = new StandardMaterial("hover-item-mt", scene)
    SPINMENU.hoverMaterial.diffuseTexture = fireTexture;
    SPINMENU.hoverMaterial.opacityTexture = fireTexture;

    SPINMENU.nodeMenu = await buildMenu(SPINMENU.position, SPINMENU.radius, SPINMENU.count, scene) as TransformNode;

    setMenuIndex(0, SPINMENU.nodeMenu, scene);
    getResultsIDB().then((data: Array<GameResult>) => {
        const res = data.filter((obj) => SPINMENU.focusItem["meta"].index === obj.level);
        let max = res[0];
        for (let i = 1; i < res.length; i++) {
            if (max.score < res[i].score) {
                max = res[i];
            }
        }
        if (max) {
            redrawResult(max.isWin, max.score);
        } else {
            redrawResult(false, 0);
        }
        showResult(true);
    });

    redrawLevelDescription(1, 0, GameState.state.lang);
    showDescription(true);
    appendEventsHtmlButtons(SPINMENU.nodeMenu, scene);

    scene.onPointerDown = (evt: IPointerEvent, pickInfo: PickingInfo, type: PointerEventTypes) => {
        const pic = scene.pick(scene.pointerX, scene.pointerY, () => true);
        if (pic.pickedMesh.name.includes("moveHandler")) {
            if (!isPointerDown) {
                isPointerDown = true;
                initPointDown = pic.pickedPoint;
            } else {
                GameState.levelRun(SPINMENU.focusItem["meta"].index);
                isPointerDown = false;
            }
        }
    }
    scene.onPointerMove = (evt: IPointerEvent, pickInfo: PickingInfo, type: PointerEventTypes) => {
        hoverItemAction(scene)
        if (isPointerDown) {
            const pic = scene.pick(scene.pointerX, scene.pointerY, () => true);
            const delta = initPointDown.x - pic.pickedPoint.x

            if (Math.abs(delta) > 5) {
                if (delta > 0) {
                    rotateToNextPosition(SPINMENU.nodeMenu, scene)
                } else {
                    rotateToPrevPosition(SPINMENU.nodeMenu, scene)
                }
                isPointerDown = false;
            }
        }
    }
    scene.onPointerUp = (evt: IPointerEvent, pickInfo: PickingInfo, type: PointerEventTypes) => {
        if (isPointerDown) {
            setTimeout(() => {
                isPointerDown = false;
            }, 300);
        }
    }
}
function hoverItemAction(scene: Scene) {
    const pic = scene.pick(scene.pointerX, scene.pointerY, () => true);
    if (pic.pickedMesh) {
        if (pic.pickedMesh.name === "moveHandler") {
            const center = SPINMENU.focusItem.getChildMeshes().filter(m => m.name === "center")[0] as Mesh;
            if (!SPINMENU.isFocusItemHover) {
                SPINMENU.isFocusItemHover = true;
                SPINMENU.isLeaveMenu = false;
                // center.material = SPINMENU.hoverMaterial;
                SPINMENU.hoverParticles = appendParticles(`${SPINMENU.focusItem.name}-particles`, center, {
                    color1: new Color4(0.4, 0.4, 0.1, 0.5), color2: new Color4(0.5, 0.3, 0.3, 0.3), color3: new Color4(0.9, 0.2, 0.2, 1),
                    capacity: 3000, emitRate: 1000, max_size: 0.9, updateSpeed: 0.05, emmitBox: new Vector3(3, 0, 3),
                    lifeTime: 5, gravityY: 1, isLocal: true, sphere: {
                        radius: 3.5, range: 1,
                    }
                }, scene);
                SPINMENU.hoverParticles.start();
            }
        } else {
            if (!SPINMENU.isLeaveMenu) {
                const center = SPINMENU.focusItem.getChildMeshes().filter(m => m.name === "center")[0] as Mesh;
                SPINMENU.hoverParticles.stop();
                //center.material = SPINMENU.standardMaterial;
                SPINMENU.isFocusItemHover = false;
                SPINMENU.isLeaveMenu = true;
            }
        }
    }
}
function setItemPosition(item: Mesh | TransformNode, position: Vector3) {
    item.position = position
    return item;
}
function setItemMaterial(item: Mesh, options: { diffuse: Color3, alpha?: number }, scene: Scene) {
    const material = new StandardMaterial("cil-mt", scene);
    material.diffuseColor = options.diffuse;
    material.specularColor = new Color3(0.3, 0.4, 1);
    material.ambientColor = new Color3(0.01, 0.02, 0.1);
    material.roughness = 0;
    material.specularPower = 0.5;
    material.twoSidedLighting = true;

    //material.backFaceCulling = true;
    material.alpha = options.alpha ?? 1;
    item.material = material;
    return item
}
function initDiffuseTexture(scene: Scene) {
    const texture_d = new Texture("public/sprites/decal.webp", scene, true, false);
    texture_d.hasAlpha = true;
    texture_d.uScale = -1;
    return texture_d;
}
function appendAnimation(host: Mesh | TransformNode, scene: Scene) {
    const keys = [
        {
            frame: 0,
            value: 0,
        },
        {
            frame: 120,
            value: Tools.ToRadians(359)
        }
    ];
    const anim = new Animation("anim", "rotation.y", 20, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE, false);
    anim.setKeys(keys);
    host.animations.push(anim);
}
//---------------------------------------------------------------
function initGeometryItemFromModels(name: string, options: { index: number }, scene: Scene) {
    const tn = new TransformNode(`${name}-${options.index}`, scene);

    const border = ITEM_MODELS.border.clone("border");
    border.isVisible = true;
    border.isEnabled(true);

    const center = ITEM_MODELS.center.clone("center");
    center.isVisible = true;
    center.isEnabled(true);


    const level = ITEM_MODELS.level.clone("level");
    level.isVisible = true;
    level.isEnabled(true);

    const number = ITEM_MODELS.numbers.get(`number-${options.index}`).clone(`number-${options.index}`);
    number.isVisible = true;
    number.isEnabled(true);

    const moveHandler = ITEM_MODELS.center.clone("moveHandler");
    moveHandler.isVisible = true;
    moveHandler.isEnabled(true);

    center.scaling = new Vector3(0.9, 0.2, 0.9);
    moveHandler.scaling = new Vector3(1.1, 0.1, 1.1);
    moveHandler.position.y = 2;
    moveHandler.position.z += 1.3;

    number.rotation.y = Tools.ToRadians(180);
    number.position.z = 0.9
    level.rotation.y = Tools.ToRadians(0);
    level.position = new Vector3(0, 1.4, -0.5);
    center.position.y = 0;
    border.position.y = 0.3;
    number.position = new Vector3(0, 1.1, 1.7);

    border.setParent(tn);
    center.setParent(tn);
    level.setParent(tn);
    number.setParent(tn);
    moveHandler.setParent(tn);

    setItemMaterial(border, { diffuse: new Color3(0.5, 0.3, 0.2) }, scene);
    setItemMaterial(center, { diffuse: new Color3(0.2, 0.2, 0.2), alpha: 0.1 }, scene);
    setItemMaterial(level, { diffuse: new Color3(0.9, 0.9, 0.9) }, scene);
    setItemMaterial(number, { diffuse: new Color3(0.7, 0.7, 0.7) }, scene);
    setItemMaterial(moveHandler, { diffuse: new Color3(0.1, 0.01, 0.01), alpha: 0.0 }, scene);

    tn.scalingDeterminant = 1.5;
    tn.position.y = 1;
    return tn;
}
async function loadItemGeometry(name: string, options: { index: number }, scene: Scene) {
    return new Promise((resolve) => {
        loadMenuItemModel(scene).then(() => {
            const container: AssetContainer = ASSETS.containers3D.get("menu_item");
            const instance = container.instantiateModelsToScene((name) => name);
            const models = instance.rootNodes[0].getChildMeshes();

            models.forEach((model: Mesh) => {
                model.isVisible = false;
                model.isEnabled(false);

                switch (model.name) {
                    case "Border": {
                        ITEM_MODELS.border = model;
                        break;
                    }
                    case "Center": {
                        ITEM_MODELS.center = model;
                        break;
                    }
                    case "Level": {
                        ITEM_MODELS.level = model;
                        break;
                    }
                    case "number-0":
                    case "number-1":
                    case "number-2":
                    case "number-3":
                    case "number-4":
                    case "number-5":
                    case "number-6":
                    case "number-7":
                    case "number-8":
                    case "number-9": {
                        ITEM_MODELS.numbers.set(model.name, model);
                        break;
                    }
                    default: {
                        console.log("switch default");
                        break;
                    }
                }
            });
        }).then(() => {
            const tn = initGeometryItemFromModels(name, { index: options.index }, scene);
            tn.position = new Vector3(0, 14, 0);
            resolve(tn);
        })
    });
}
async function menuItem(name: string, options: { index: number, angle: number }, scene: Scene) {
    return new Promise<TransformNode>((resolve) => {
        loadItemGeometry(name, { index: options.index }, scene).then((tn: TransformNode) => {
            tn["meta"] = {
                name: name,
                index: options.index,
                angle: options.angle
            }
            resolve(tn);
        });
    });
}
function buildMenu(position: Vector3, radius: number, count: number, scene: Scene) {

    const tn = new TransformNode("menu-tn", scene);

    SPINMENU.angle = 360 / count;
    SPINMENU.angleDelta = SPINMENU.angle * 1.5;

    const promises = new Array<Promise<TransformNode>>();

    [...Array(count).keys()].forEach((val) => {
        promises.push(menuItem(`item-${val}`, { index: val, angle: (SPINMENU.angle) * val + SPINMENU.angleDelta }, scene));
    });

    return new Promise((resolve) => {
        Promise.all(promises).then((res) => {
            res.forEach((item: TransformNode, index) => {
                SPINMENU.items.set(index, item);
                item.scalingDeterminant = SPINMENU.scaleDeterminant;
                item.setParent(tn);
                setItemPosition(item as TransformNode, new Vector3(
                    Math.cos(Tools.ToRadians(SPINMENU.angle * index)) * radius,
                    0,
                    Math.sin(Tools.ToRadians(SPINMENU.angle * index)) * radius,
                ));
            });
            tn.rotation.y = Tools.ToRadians(SPINMENU.angleDelta);
            tn.position = position;
            resolve(tn);
        });
    })

}
//-Rotate Menu ----------------------------------------
function setMenuIndex(index: number, menu: TransformNode, scene: Scene) {
    const item = SPINMENU.items.get(index);
    const preItem = SPINMENU.focusItem;

    item.rotation.y = Tools.ToRadians(-item["meta"].angle);

    let angle = Tools.ToRadians(item["meta"].angle);

    if (preItem) {
        //390 -> 90, 90 -> 390
        if (preItem["meta"].angle === 390 && item["meta"].angle === 90) {
            menu.rotation.y = Tools.ToRadians(30);
        }
        if (preItem["meta"].angle === 90 && item["meta"].angle === 390) {
            menu.rotation.y = Tools.ToRadians(450);
        }
    }

    const rotateAnim = rotateMenuAnimation(menu, angle);
    scene.beginAnimation(menu, 0, 120, false, 2, () => {
        scene.removeAnimation(rotateAnim);
    })

    const posAnim = positionYItemAnimation(item)
    const scaleAnim = scaleUpItemAnimation(item);
    scene.beginAnimation(item, 0, 60, false, 2, () => {
        scene.removeAnimation(posAnim);
        scene.removeAnimation(scaleAnim);
    });

    if (preItem) {
        const posOldAnim = positionYItemAnimation(preItem);
        const scaleOldAnim = scaleUpItemAnimation(preItem);
        scene.beginAnimation(preItem, 60, 0, false, 2, () => {
            scene.removeAnimation(posOldAnim);
            scene.removeAnimation(scaleOldAnim);
        });
    }
    redrawLevelDescription(1, index, "ru");
    getResultsIDB().then((data: Array<GameResult>) => {
        const res = data.filter((obj) => SPINMENU.focusItem["meta"].index === obj.level);
        let max = res[0];
        for (let i = 1; i < res.length; i++) {
            if (max.score < res[i].score) {
                max = res[i];
            }
        }
        if (max) {
            redrawResult(max.isWin, max.score);
        } else {
            redrawResult(false, 0);
        }
        showResult(true);
    });
    SPINMENU.focusItem = item;
}
export function rotateToNextPosition(menu: TransformNode, scene: Scene) {
    let index = (SPINMENU.focusItem ? SPINMENU.focusItem["meta"].index : 0) + 1;
    index = index >= SPINMENU.count ? 0 : index;
    setMenuIndex(index, menu, scene)
}
export function rotateToPrevPosition(menu: TransformNode, scene: Scene) {
    let index = (SPINMENU.focusItem ? SPINMENU.focusItem["meta"].index : 0) - 1;
    index = index < 0 ? (SPINMENU.count - 1) : index;
    setMenuIndex(index, menu, scene)
}
function appendEventsHtmlButtons(menu: TransformNode, scene: Scene) {
    const leftButton = document.querySelector(".left-menu-button");
    const rightButton = document.querySelector(".right-menu-button");

    leftButton.addEventListener("click", () => {
        rotateToPrevPosition(menu, scene)
    })
    rightButton.addEventListener("click", () => {
        rotateToNextPosition(menu, scene)
    })
    showSpinMenuButtons(true);
}
//- Animations ------------------------------------------

function rotateMenuAnimation(item: TransformNode, angle: number) {
    const startAngl = item.rotation.clone();
    const keys = [
        {
            frame: 0,
            value: startAngl.y,
        },
        {
            frame: 120,
            value: angle
        }
    ];
    const anim = new Animation("rotate-menu-anim", "rotation.y", 120, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT, false);
    anim.setKeys(keys);
    item.animations.push(anim);
    return anim;
}
function scaleUpItemAnimation(item: TransformNode) {
    const keys = [
        {
            frame: 0,
            value: SPINMENU.scaleDeterminant,
        },
        {
            frame: 60,
            value: SPINMENU.scaleDeterminantMax
        }
    ];
    const anim = new Animation("scale-menu-anim", "scalingDeterminant", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT, false);
    anim.setKeys(keys);
    item.animations.push(anim);
    return anim;
}
function positionYItemAnimation(item: TransformNode) {
    const startPos = item.position.clone()
    const endPos = startPos.add(new Vector3(0, 0, 0))
    const keys = [
        {
            frame: 0,
            value: startPos,
        },
        {
            frame: 60,
            value: endPos
        }
    ];
    const anim = new Animation("posY-menuanim", "position", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT, false);
    anim.setKeys(keys);
    item.animations.push(anim);
    return anim;
}