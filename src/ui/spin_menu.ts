import { ASSETS } from "@/game_state/assets/state";
import { loadMenuItem2Model } from "@/utils/loaderGlbFiles";
import {
    Animation, AssetContainer, BezierCurveEase, CircleEase, Color3, DynamicTexture, EasingFunction,
    Engine,
    ICanvasRenderingContext,
    Mesh, MeshBuilder, PBRMaterial, Scene, StandardMaterial, Texture, Tools, TransformNode, Vector3
} from "@babylonjs/core";

const SPINMENUSTATE = {
    positions: 12, // колличество пунктов меню
    diameter: 11, // диаметр меню
    item_size: { // размер пунктов меню
        width: 4,
        height: 4
    },
    angle: null, // угол между пунктами меню 360/колличество пунктов
    node: null, // узел трансформации меню
    start_item: 0, // начальная позиция
    items: new Map<string, { item: TransformNode, angle: number, level: number }>(), // хранилище углов расположения пунктов меню
    prefix_item: `menu-item-`, // префикс имён пунктов меню
    deltaZ: 90, // угол доворота меню по оси Z 
    select_place: 1.1, // зона выбора пункта меню (при клике/наведению) мышью
    menu_y_position: 5,
    focus_item: null,
    colors: {
        standart: "rgb(20,20,150)",
        focus: "rgb(120,100,10)"
    }
}

export function spinMenu(position: Vector3, scene: Scene) {
    SPINMENUSTATE.angle = 360 / SPINMENUSTATE.positions;
    loadMenuItem2Model(scene).then(() => {
        SPINMENUSTATE.node = new TransformNode("menu-rotate-tn", scene);
        //--------------------------------------------------------->        
        const item_tn = initMenuItemElementsFromModel(scene);

        [...Array(SPINMENUSTATE.positions).keys()].forEach((i) => {
            const name = `${SPINMENUSTATE.prefix_item}${i}`;
            const angle = Tools.ToRadians(i * (SPINMENUSTATE.angle));

            const itm = newItemMenu(item_tn, {
                name: name,
                rotation: angle,
                position: new Vector3(
                    position.x + Math.cos(angle) * SPINMENUSTATE.diameter,
                    position.y + Math.sin(angle) * SPINMENUSTATE.diameter,
                    position.z)
            }, scene);

            const text_mesh = itm.getChildMeshes().filter((m) => m.name.includes("Center"))[0];
            if (text_mesh && text_mesh instanceof Mesh) {
                appendTextItemMenu(text_mesh, `${i}`, scene);
            }

            itemShow(itm);
            SPINMENUSTATE.items.set(name, { item: itm, angle: i * SPINMENUSTATE.angle, level: i });
            itm.setParent(SPINMENUSTATE.node);
        });
        SPINMENUSTATE.node.position = position.add(new Vector3(0, SPINMENUSTATE.menu_y_position, 0));
        spinMenuByIndexItem(0);
    });
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
const ITEMSTATE = {
    border: null,
    center: null,
    left: null,
    right: null,
    left_arrow: null,
    left_sub_arrow: null,
    right_arrow: null,
    right_sub_arrow: null
}
function newItemMenu(base: TransformNode, options: { name: string, rotation: number, position: Vector3 }, scene: Scene) {
    const itm = base.clone(options.name, null, false);
    itm.rotation.z += options.rotation;
    itm.position = options.position;
    itm.isEnabled(true);
    return itm;
}
function initMenuItemElementsFromModel(scene: Scene) {
    const tn = new TransformNode("item-tn", scene);
    const asset = ASSETS.containers3D.get("menu_item") as AssetContainer;
    const instance_item = asset.instantiateModelsToScene((name) => name, true);
    const item_elements = instance_item.rootNodes[0].getChildMeshes();

    item_elements.forEach(m => {
        m.setParent(tn);
    });
    tn.scaling = new Vector3(0.6, 0.6, 0.6);
    itemHide(tn);
    return tn;
}
function initMenuItemFromNativeElements(scene: Scene) {
    const tn = new TransformNode("item-tn", scene);

    const m = MeshBuilder.CreateBox("-native-box-item", { width: 0.5, height: 4, depth: 4, updatable: true }, scene);
    m.name = "Center";

    m.setParent(tn);
    tn.scaling = new Vector3(2, 2, 2)
    return tn;
}
//-- DynamicTexture Work ----------------------------->
function redrawText(text: string, options: { back_color: string }, ctx: ICanvasRenderingContext) {
    ctx.clearRect(0, 0, 1024, 1024);
    ctx.fillStyle = options.back_color;
    ctx.fillRect(0, 0, 512, 512);
    //---------------------------------------------------
    formatTextCtx("Level:", 60, { x: 180, y: 350 }, ctx)
    formatTextCtx(text, 150, { x: 210, y: 200 }, ctx);
    formatTextCtx("result: 1200", 40, { x: 160, y: 120 }, ctx);
    //-----------------------------------------------------------
}
function formatTextCtx(text: string, font_size: number, position: { x: number, y: number }, ctx: ICanvasRenderingContext) {
    ctx.save();
    ctx.font = `${font_size}px Arial`;
    ctx.translate(position.x, position.y);
    const measure_text = ctx.measureText(text);
    const text_pos_x = measure_text.width / 2;

    ctx.translate(-text_pos_x, 0);
    ctx.scale(1, -1);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillText(text, text_pos_x, 0);
    ctx.restore();
}
function appendTextItemMenu(item: Mesh, text: string, scene: Scene) {
    const texture_width = 1024;
    const texture_height = 1024;
    const font_size = 70;
    const font = `${font_size}px Arial, serif`;

    const txt = new DynamicTexture("item-menu-txt", { width: texture_width, height: texture_height }, scene);
    txt.hasAlpha = true;
    txt.uAng = Tools.ToRadians(0);
    txt.vAng = Tools.ToRadians(0);

    const ctx = txt.getContext();
    ctx.font = font;
    redrawText(text, { back_color: SPINMENUSTATE.colors.standart }, ctx);
    txt.update();

    const material = new StandardMaterial("round-menu-mt", scene);
    material.diffuseTexture = txt;
    material.alpha = 1;
    item.material = material;

    //------------PBR Material------------------------------->
    // const pbr = (item.material as PBRMaterial).clone("npbr");
    // pbr.albedoTexture = txt;
    // pbr.emissiveTexture = txt;
    // pbr.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
    // pbr.useAlphaFromAlbedoTexture = true;
    // item.material = pbr
}
function itemHide(node: TransformNode) {
    node.getChildMeshes().forEach(m => {
        m.isVisible = false;
    });
}
function itemShow(node: TransformNode) {
    node.getChildMeshes().forEach(m => {
        m.isVisible = true;
    });
}
//-- POINTER Event --------------------------------------->
function movePointerItem(item_object: { item: TransformNode, angle: number, level: number }) {
    SPINMENUSTATE.focus_item = item_object;
    const center = item_object.item.getChildMeshes().filter((m) => m.name.includes(".Center"))[0];
    const material = center.material as StandardMaterial;
    const texture = material.diffuseTexture as DynamicTexture;
    const ctx = texture.getContext();
    redrawText(`${item_object.level}`, { back_color: SPINMENUSTATE.colors.focus }, ctx);
    texture.update();
}
export function clearFocusItem() {
    if (SPINMENUSTATE.focus_item) {
        const center = SPINMENUSTATE.focus_item.item.getChildMeshes().filter((m) => m.name.includes(".Center"))[0];
        const material = center.material as StandardMaterial;
        const texture = material.diffuseTexture as DynamicTexture;
        const ctx = texture.getContext();
        redrawText(`${SPINMENUSTATE.focus_item.level}`, { back_color: SPINMENUSTATE.colors.standart }, ctx);
        texture.update();
        SPINMENUSTATE.focus_item = null;
    }
}


