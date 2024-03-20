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
    Color4,
    ParticleSystem,
    MeshBuilder,
    HemisphericLight,
} from "@babylonjs/core";
import { getMaxProgressForLevel, getStateLevel, getUPResultsIDB, saveUPResultIDB } from "@/DB/indexdb";
import { appendParticles } from "@/utils/clear_utils";
import { UISTATE } from "@/game_state/ui/state";

const ITEM_MODELS = {
    border: null as Mesh,
    center: null as Mesh,
    levelEn: null as Mesh,
    levelRu: null as Mesh,
    numbers: new Map<string, Mesh>(),
    partsRu: new Map<string, Mesh>(),
    partsEn: new Map<string, Mesh>(),
    checkBox: null as Mesh,
    checkOk: null as Mesh,
    checkErr: null as Mesh,
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
    hoverParticles: null as ParticleSystem,
    checkBox: {
        state: false,
        position: new Vector3(-3, 9, 4),
        okModel: null as Mesh,
        errModel: null as Mesh,
    }
}

export async function spinMenu(scene: Scene) {
    let isPointerDown = false;
    let initPointDown: Vector3 = null;
    SPINMENU.standardMaterial = new StandardMaterial("standard-item-mt", scene);
    SPINMENU.standardMaterial.diffuse = new Color3(0.2, 0.2, 0.2);

    await fillItemModel(scene);

    SPINMENU.nodeMenu = buildMenu(SPINMENU.position, SPINMENU.radius, SPINMENU.count, scene) as TransformNode;
    setMenuIndex(0, SPINMENU.nodeMenu, scene);

    //---- CheckBox --------------
    checkBox(SPINMENU.checkBox.position, scene);
    const res = await getUPResultsIDB();
    if (!res) {
        saveUPResultIDB({ level: 0 });
        getStateLevel(0).then(res => {
            setCheckBoxState(res);
        })
    } else {
        getStateLevel(res.level).then(res => {
            setCheckBoxState(res);
        })
    }
    //---- Part ------------------


    //---- Events ----------------
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
                    rotateToNextPosition(SPINMENU.nodeMenu, scene);
                } else {
                    rotateToPrevPosition(SPINMENU.nodeMenu, scene);
                }
                getStateLevel(SPINMENU.focusItem["meta"].index).then(res => {
                    setCheckBoxState(res);
                })
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
            const border = SPINMENU.focusItem.getChildMeshes().filter(m => m.name === "border")[0] as Mesh;
            const center = SPINMENU.focusItem.getChildMeshes().filter(m => m.name === "center")[0] as Mesh;
            border.rotation.x += Tools.ToRadians(30);
            if (!SPINMENU.isFocusItemHover) {
                SPINMENU.isFocusItemHover = true;
                SPINMENU.isLeaveMenu = false;
                SPINMENU.hoverParticles = appendParticles(`${SPINMENU.focusItem.name}-particles`, center, {
                    color1: new Color4(0.4, 0.4, 0.1, 0.5), color2: new Color4(0.5, 0.3, 0.3, 0.3), color3: new Color4(0.9, 0.2, 0.2, 1),
                    capacity: 1000, emitRate: 200, max_size: 0.9, updateSpeed: 0.05, emmitBox: new Vector3(3, 0, 3),
                    lifeTime: 5, gravityY: 1, isLocal: true, sphere: {
                        radius: 3.5, range: 1,
                    }
                }, scene);
                SPINMENU.hoverParticles.start();
            }
        } else {
            if (!SPINMENU.isLeaveMenu) {
                const border = SPINMENU.focusItem.getChildMeshes().filter(m => m.name === "border")[0] as Mesh;
                const center = SPINMENU.focusItem.getChildMeshes().filter(m => m.name === "center")[0] as Mesh;
                SPINMENU.hoverParticles.stop();
                //center.material = SPINMENU.standardMaterial;
                SPINMENU.isFocusItemHover = false;
                SPINMENU.isLeaveMenu = true;
                // border.rotation.x -= Tools.ToRadians(30);
            }
        }
    }
}
function setItemPosition(item: Mesh | TransformNode, position: Vector3) {
    item.position = position
    return item;
}
function setItemMaterial(item: Mesh, options: { diffuse: Color3, alpha?: number, simple: boolean }, scene: Scene) {
    const material = new StandardMaterial("cil-mt", scene);
    material.diffuseColor = options.diffuse;
    material.specularColor = new Color3(0.3, 0.4, 0.6);
    material.ambientColor = new Color3(0.01, 0.02, 0.1);
    if (!options.simple) {
        material.diffuseTexture = new Texture("public/images/t_ru/t_dif.webp");
        material.bumpTexture = new Texture("public/images/t_ru/t_n.webp");
    }
    material.roughness = 0;
    material.specularPower = 1;
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

    const border = cloner(ITEM_MODELS.border, "border");
    const center = cloner(ITEM_MODELS.center, "center");
    const level = GameState.lang() === "ru" ? cloner(ITEM_MODELS.levelRu, "level") : cloner(ITEM_MODELS.levelEn, "level");
    const number = cloner(ITEM_MODELS.numbers.get(`number-${options.index}`), `number-${options.index}`);
    const moveHandler = cloner(ITEM_MODELS.center, "moveHandler");

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

    setItemMaterial(border, { diffuse: new Color3(0.5, 0.3, 0.2), simple: false }, scene);
    setItemMaterial(center, { diffuse: new Color3(0.2, 0.2, 0.2), alpha: 0.1, simple: true }, scene);
    setItemMaterial(level, { diffuse: new Color3(0.9, 0.9, 0.9), simple: true }, scene);
    setItemMaterial(number, { diffuse: new Color3(0.7, 0.7, 0.7), simple: true }, scene);
    setItemMaterial(moveHandler, { diffuse: new Color3(0.1, 0.01, 0.01), alpha: 0.0, simple: true }, scene);

    tn.scalingDeterminant = 1.5;
    tn.position.y = 1;
    return tn;
}
function menuItem(name: string, options: { index: number, angle: number }, scene: Scene) {
    const tn = initGeometryItemFromModels(name, { index: options.index }, scene);
    tn.position = new Vector3(0, 4, 0);
    tn["meta"] = {
        name: name,
        index: options.index,
        angle: options.angle
    }
    // return Promise.resolve<TransformNode>(tn);
    return tn;
}
function buildMenu(position: Vector3, radius: number, count: number, scene: Scene) {
    const tn = new TransformNode("menu-tn", scene);

    SPINMENU.angle = 360 / count;
    SPINMENU.angleDelta = SPINMENU.angle * 1.5;

    const promises = new Array<Promise<TransformNode>>();
    const tns = new Array<TransformNode>();

    [...Array(count).keys()].forEach((val) => {

        const tn = menuItem(`item-${val}`, { index: val, angle: (SPINMENU.angle) * (val) + SPINMENU.angleDelta }, scene);
        //promises.push(tn);
        tns.push(tn);
    });

    tns.forEach((item: TransformNode, index) => {
        SPINMENU.items.set(index, item);
        item.scalingDeterminant = SPINMENU.scaleDeterminant;
        item.setParent(tn);
        setItemPosition(item as TransformNode, new Vector3(
            Math.cos(Tools.ToRadians(SPINMENU.angle * (index))) * radius,
            0,
            Math.sin(Tools.ToRadians(SPINMENU.angle * (index))) * radius,
        ));
    });
    tn.rotation.y = Tools.ToRadians(SPINMENU.angleDelta);
    tn.position = position;
    return tn;
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
            console.log("Prev")
        }
        if (preItem["meta"].angle === 90 && item["meta"].angle === 390) {
            menu.rotation.y = Tools.ToRadians(450);
            console.log("Next")
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
    SPINMENU.focusItem = item;
    getMaxProgressForLevel(SPINMENU.focusItem["meta"].index);
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
//-ITEMMODEL --------------------------------------------
async function fillItemModel(scene: Scene) {
    const asset = await loadMenuItemModel(scene);
    const instance = (asset as AssetContainer).instantiateModelsToScene((name) => name);
    parseModel(instance.rootNodes[0].getChildMeshes());
}
function parseModel(models: Array<Mesh>) {
    models.forEach((model: Mesh) => {
        model.isVisible = false;
        model.isEnabled(false);
        if (model.name.includes("part")) {
            if (model.name.includes("ru")) {
                ITEM_MODELS.partsRu.set(model.name, model);
            } else if (model.name.includes("en")) {
                ITEM_MODELS.partsEn.set(model.name, model);
            }
        }

        switch (model.name) {
            case "Border": {
                ITEM_MODELS.border = model;
                break;
            }
            case "Center": {
                ITEM_MODELS.center = model;
                break;
            }
            case "Level_en": {
                ITEM_MODELS.levelEn = model;
                break;
            }
            case "Level_ru": {
                ITEM_MODELS.levelRu = model;
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
            case "CheckBox": {
                ITEM_MODELS.checkBox = model;
                break;
            }
            case "Ok": {
                ITEM_MODELS.checkOk = model;
                break;
            }
            case "Error": {
                ITEM_MODELS.checkErr = model;
                break;
            }
            default: {
                console.log("switch default");
                break;
            }
        }
    });
}
function cloner(mesh: Mesh, name: string) {
    const clone = mesh.clone(name);
    clone.isVisible = true;
    clone.isEnabled(true);
    return clone;
}
function checkBox(position: Vector3, scene: Scene) {
    const tn = new TransformNode("checkBox-tn", scene);
    const checkBox = cloner(ITEM_MODELS.checkBox, "checkBox");
    SPINMENU.checkBox.okModel = cloner(ITEM_MODELS.checkOk, "checkOk");
    SPINMENU.checkBox.errModel = cloner(ITEM_MODELS.checkErr, "checkErr");
    checkBox.setParent(tn);
    SPINMENU.checkBox.okModel.setParent(tn);
    SPINMENU.checkBox.errModel.setParent(tn);
    tn.scalingDeterminant = 0.5;
    tn.position = position;
    tn.rotation.x = Tools.ToRadians(60);
    tn.rotation.z = Tools.ToRadians(-5);

    const material = new StandardMaterial("checkBox-mt", scene);
    material.diffuseColor = new Color3(0.9, 0.9, 0.9);
    material.diffuseTexture = new Texture("public/images/t_ru/t_dif.webp");
    material.bumpTexture = new Texture("public/images/t_ru/t_n.webp");
    material.specularColor = new Color3(0.3, 0.4, 0.6);
    material.ambientColor = new Color3(0.01, 0.02, 0.1);
    material.specularPower = 1;
    checkBox.material = material;

    const materialOk = new StandardMaterial("checkBoxOk-mt", scene);
    materialOk.diffuseColor = new Color3(0.1, 0.9, 0.1);
    SPINMENU.checkBox.okModel.material = materialOk;

    const materialErr = new StandardMaterial("checkBoxErr-mt", scene);
    materialErr.diffuseColor = new Color3(0.9, 0.1, 0.1);
    SPINMENU.checkBox.errModel.material = materialErr;

    const light = new HemisphericLight("ui-checkBox-light", new Vector3(0, 10, 10), scene);
    light.diffuse = new Color3(1, 1, 1);
    light.specular = new Color3(0, 0, 0);
    light.intensityMode = 1;
    light.intensity = 0.5;
    light.includedOnlyMeshes = [checkBox, SPINMENU.checkBox.okModel, SPINMENU.checkBox.errModel];
    setCheckBoxState(SPINMENU.checkBox.state);
}
export function setCheckBoxState(state: boolean) {
    if (state) {
        SPINMENU.checkBox.okModel.isVisible = true;
        SPINMENU.checkBox.errModel.isVisible = false;
    } else {
        SPINMENU.checkBox.okModel.isVisible = false;
        SPINMENU.checkBox.errModel.isVisible = true;
    }
}