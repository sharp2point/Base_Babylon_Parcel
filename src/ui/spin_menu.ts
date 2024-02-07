import { GameState } from "@/game_state/game_state";
import {
    Animation, Color3, DynamicTexture,
    ICanvasRenderingContext, Mesh, MeshBuilder,
    Scene, StandardMaterial, Tools, TransformNode, Vector3
} from "@babylonjs/core";

const SPINMENUSTATE = {
    positions: 8, // колличество пунктов меню
    diameter: 7, // диаметр меню
    item_size: { // размер пунктов меню
        width: 4,
        height: 4
    },
    angle: null, // угол между пунктами меню 360/колличество пунктов
    node: null, // узел трансформации меню
    start_item: 0, // начальная позиция
    items: new Map<string, { item: TransformNode, angle: number, level: number, result: string }>(), // хранилище углов расположения пунктов меню
    prefix_item: `menu-item-`, // префикс имён пунктов меню
    deltaZ: 90, // угол доворота меню по оси Z 
    select_place: 1.1, // зона выбора пункта меню (при клике/наведению) мышью
    menu_y_position: 5,
    focus_item: null,
    colors: {
        standart: "rgba(20,20,150,0.6)",
        focus: "rgba(120,100,10,0.6)"
    }
}

export function spinMenu(position: Vector3, scene: Scene) {
    SPINMENUSTATE.angle = 360 / SPINMENUSTATE.positions;
    SPINMENUSTATE.node = new TransformNode("menu-rotate-tn", scene);
    //--------------------------------------------------------->        
    const base = initMenuItemFromNativeElements(scene);

    [...Array(SPINMENUSTATE.positions).keys()].forEach((i) => {
        const name = `${SPINMENUSTATE.prefix_item}${i}`;
        const angle = Tools.ToRadians(i * (SPINMENUSTATE.angle));

        const itm = newItemMenu(base, {
            name: name,
            rotation: angle,
            position: new Vector3(
                position.x + Math.cos(angle) * SPINMENUSTATE.diameter,
                position.y + Math.sin(angle) * SPINMENUSTATE.diameter,
                position.z)
        }, scene);

        SPINMENUSTATE.items.set(name, { item: itm, angle: i * SPINMENUSTATE.angle, level: i, result: '0' });
        itm["meta"] = {
            level: i,
            result: '0'
        }
        appendTextItemMenu(itm, `${i}`, scene);
        itm.setParent(SPINMENUSTATE.node);
    });
    SPINMENUSTATE.node.position = position.add(new Vector3(0, SPINMENUSTATE.menu_y_position, 0));
    spinMenuByIndexItem(0);
}
export function spinMenuByIndexItem(itemIndex: number) {
    itemIndex = itemIndex >= 0 ? itemIndex : SPINMENUSTATE.positions + itemIndex;
    const index = Math.abs(itemIndex % SPINMENUSTATE.positions);
    const angle = SPINMENUSTATE.items.get(`${SPINMENUSTATE.prefix_item}${index}`).angle;
    spinMenuOnAngle(angle + SPINMENUSTATE.deltaZ);
}
export function getItemOnPointerDown(name: string, picked_point: number) {
    name = name.split(".Center")[0];
    if (picked_point < -SPINMENUSTATE.select_place) {
        clearFocusItem();
        spinMenuToNext();
    } else if (picked_point > SPINMENUSTATE.select_place) {
        clearFocusItem();
        spinMenuToPrev();
    } else {
        const level = SPINMENUSTATE.items.get(`${name}`).level;
        GameState.levelRun(level);
        //console.log("Start level: ", level)
    }
}
export function menuItemOnPointerMove(name: string, movePoint: Vector3) {
    name = name.split(".Center")[0];
    const item = SPINMENUSTATE.items.get(`${name}`);
    if (movePoint.x < -SPINMENUSTATE.select_place) {
        //console.log("NEXT")
    } else if (movePoint.x > SPINMENUSTATE.select_place) {
        //console.log("PREV")
    } else {
        //console.log("SELCT ITEM")
        movePointerItem(item);
    }
}
export function spinMenuToNext() {
    spinMenuOnAngle(SPINMENUSTATE.angle, true)
}
export function spinMenuToPrev() {
    spinMenuOnAngle(-SPINMENUSTATE.angle, true)
}
function spinMenuOnAngle(angle: number, is_add: boolean = false) {
    if (is_add) {
        // SPINMENUSTATE.node.rotation.z += Tools.ToRadians(angle);
        spinAnimation(SPINMENUSTATE.node,
            SPINMENUSTATE.node.rotation.z,
            (SPINMENUSTATE.node.rotation.z + Tools.ToRadians(angle))
        );
    } else {
        spinAnimation(SPINMENUSTATE.node, SPINMENUSTATE.node.rotation.z, Tools.ToRadians(angle));
    }
}
function spinAnimation(node: TransformNode, start_value: number, end_value: number) {
    const scene = node.getScene();

    const keys = [
        { frame: 0, value: start_value },
        { frame: 60, value: end_value }
    ];
    const anim = new Animation("spin-menu-anim", "rotation.z", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    anim.setKeys(keys);
    node.animations.push(anim);
    scene.beginAnimation(node, 0, 60, false, 2);
}

//--MENU ITEM-------------------------------->

function newItemMenu(base: TransformNode, options: { name: string, rotation: number, position: Vector3 }, scene: Scene) {
    const itm = base.clone(options.name, null, false);
    itm.rotation.z += options.rotation;
    itm.position = options.position;
    const center = itm.getChildMeshes().filter((mesh) => mesh.name.includes("Center"))[0];
    center.isVisible = true;
    center.isEnabled(true);
    return itm;
}
function initMenuItemFromNativeElements(scene: Scene) {
    const tn = new TransformNode("item-tn", scene);

    const m = MeshBuilder.CreateBox("Center", { width: 0.5, height: 4, depth: 4, updatable: true }, scene);
    m.isVisible = false;
    m.isEnabled(false);
    m.setParent(tn);
    tn.scaling = new Vector3(1.1, 1.1, 1.1)
    return tn;
}
//-- DynamicTexture Work ----------------------------->
function redrawText(text: string, options: { back_color: string, result?: string }, texture: DynamicTexture) {
    const res = options.result ?? 0
    const ctx = texture.getContext();
    ctx.clearRect(0, 0, 512, 512);
    ctx.fillStyle = options.back_color;
    ctx.fillRect(0, 0, 512, 512);
    //---------------------------------------------------
    formatTextCtx("Level:", 70, { x: 70, y: 120 }, ctx)
    formatTextCtx(text, 180, { x: 220, y: 300 }, ctx);
    formatTextCtx(`${res}`, 70, { x: 260, y: 450 }, ctx);
    //-----------------------------------------------------------
    texture.update();
}
function formatTextCtx(text: string, font_size: number, position: { x: number, y: number }, ctx: ICanvasRenderingContext) {
    ctx.save();
    ctx.font = `${font_size}px Arial`;
    ctx.translate(position.x, position.y);
    const measure_text = ctx.measureText(text);
    const text_pos_x = measure_text.width / 2;

    ctx.translate(-text_pos_x, 0);
    ctx.scale(1, 1);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillText(text, text_pos_x, 0);
    ctx.restore();
}
function appendTextItemMenu(item: TransformNode, text: string, scene: Scene) {
    const texture_width = 512;
    const texture_height = 512;
    const font_size = 70;

    const txt = new DynamicTexture(`${item.name}-txt`, { width: texture_width, height: texture_height }, scene);
    txt.hasAlpha = true;

    redrawText(`${item["meta"].level}`, { back_color: SPINMENUSTATE.colors.standart, result: item["meta"].result }, txt);

    const material = new StandardMaterial("round-menu-mt", scene);
    material.diffuseColor = new Color3(1, 1, 1);
    material.diffuseTexture = txt;
    material.alpha = 1;
    const text_mesh = item.getChildMeshes().filter((m) => m.name.includes("Center"))[0];
    if (text_mesh && text_mesh instanceof Mesh) {
        text_mesh.material = material;
    }
}
//-- POINTER Event --------------------------------------->
function movePointerItem(item_object: { item: TransformNode, angle: number, level: number, result: string }) {
    SPINMENUSTATE.focus_item = item_object;
    const center = item_object.item.getChildMeshes().filter((m) => m.name.includes(".Center"))[0];
    const material = center.material as StandardMaterial;

    redrawText(`${item_object.level}`, { back_color: SPINMENUSTATE.colors.focus, result: `${item_object.result}` }, material.diffuseTexture as DynamicTexture);
}
export function clearFocusItem() {
    if (SPINMENUSTATE.focus_item) {
        const center = SPINMENUSTATE.focus_item.item.getChildMeshes().filter((m) => m.name.includes(".Center"))[0];
        const material = center.material as StandardMaterial;
        redrawText(`${SPINMENUSTATE.focus_item.item["meta"].level}`, {
            back_color: SPINMENUSTATE.colors.standart,
            result: `${SPINMENUSTATE.focus_item.item["meta"].result}`
        }, material.diffuseTexture as DynamicTexture);
        SPINMENUSTATE.focus_item = null;
    }
}

export function resultRedraw(level: number, points: number) {
    const item = SPINMENUSTATE.items.get(`${SPINMENUSTATE.prefix_item}${level}`).item;
    item["meta"].result = `${points}`.padStart(4, '0');
    SPINMENUSTATE.items.get(`${SPINMENUSTATE.prefix_item}${level}`).result = item["meta"].result
    const center = item.getChildMeshes().filter((m) => m.name.includes(".Center"))[0];
    const material = center.material as StandardMaterial;
    redrawText(`${level}`, { back_color: SPINMENUSTATE.colors.standart, result: item["meta"].result }, material.diffuseTexture as DynamicTexture);
}


