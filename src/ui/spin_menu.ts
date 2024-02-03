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
    items: new Map<string, number>(), // хранилище углов расположения пунктов меню
    prefix_item: `menu-item-`, // префикс имён пунктов меню
    deltaZ: 90, // угол доворота меню по оси Z 
    select_place: 1.5 // зона выбора пункта меню (при клике/наведению) мышью
}

export function spinMenu(position: Vector3, scene: Scene) {
    SPINMENUSTATE.angle = 360 / SPINMENUSTATE.positions;
    loadMenuItem2Model(scene).then(() => {
        SPINMENUSTATE.node = new TransformNode("menu-rotate-tn", scene);
        //--------------------------------------------------------->        
        const item_tn = initMenuItemElementsFromModel(scene);
        //const item_tn = initMenuItemFromNativeElements(scene);


        [...Array(SPINMENUSTATE.positions).keys()].forEach((i) => {
            const name = `${SPINMENUSTATE.prefix_item}${i}`;
            const angle = Tools.ToRadians(i * (SPINMENUSTATE.angle));
            SPINMENUSTATE.items.set(name, i * SPINMENUSTATE.angle);

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
            itm.setParent(SPINMENUSTATE.node);
        });
        SPINMENUSTATE.node.position = position.add(new Vector3(0, 5, 0));
        spinMenuByIndexItem(0);
    });
}
export function spinMenuByIndexItem(itemIndex: number) {
    itemIndex = itemIndex >= 0 ? itemIndex : SPINMENUSTATE.positions + itemIndex;
    const index = Math.abs(itemIndex % SPINMENUSTATE.positions);
    const angle = SPINMENUSTATE.items.get(`${SPINMENUSTATE.prefix_item}${index}`);
    spinMenuOnAngle(angle + SPINMENUSTATE.deltaZ);
}
export function getItemOnPointerDown(name: string) {
    //console.log(name, "-> angle: ", SPINMENUSTATE.items.get(name));
}
export function menuItemOnPointerMove(movePoint: Vector3) {
    if (movePoint.x < -SPINMENUSTATE.select_place) {
        console.log("NEXT")
    } else if (movePoint.x > SPINMENUSTATE.select_place) {
        console.log("PREV")
    } else {
        console.log("SELCT ITEM")
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

//---------------------------------------------->
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
    // const m = Mesh.MergeMeshes(item_elements as Array<Mesh>, true, false, null, false, false);
    item_elements.forEach(m => {
        m.setParent(tn);
    });
    tn.scaling = new Vector3(0.7, 0.7, 0.7);
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
function setMaterialToItemMenu(scene: Scene) {
    const border_mt = new StandardMaterial("border-item-mt", scene);
    border_mt.diffuseColor = new Color3(1, 1, 0.1);
    ITEMSTATE.border.material = border_mt;

    const left_mt = new StandardMaterial("left-item-mt", scene);
    left_mt.diffuseColor = new Color3(0.1, 0.1, 0.15);
    ITEMSTATE.left.material = left_mt;

    const right_mt = new StandardMaterial("right-item-mt", scene);
    right_mt.diffuseColor = new Color3(0.1, 0.15, 0.1);
    ITEMSTATE.right.material = right_mt;

    // const center_mt = new StandardMaterial("center-item-mt", scene);
    // center_mt.diffuseColor = new Color3(0.15, 0.1, 0.1);
    // ITEMSTATE.center.material = center_mt;

    const larrow_mt = new StandardMaterial("larrow-item-mt", scene);
    larrow_mt.diffuseColor = new Color3(0.1, 0.1, 0.2);
    ITEMSTATE.left_arrow.material = larrow_mt;

    const rarrow_mt = new StandardMaterial("rarrow-item-mt", scene);
    rarrow_mt.diffuseColor = new Color3(0.2, 0.1, 0.1);
    ITEMSTATE.right_arrow.material = rarrow_mt;

    const lsarrow_mt = new StandardMaterial("lsarrow-item-mt", scene);
    lsarrow_mt.diffuseColor = new Color3(0.1, 0.1, 0.2);
    ITEMSTATE.left_sub_arrow.material = lsarrow_mt;

    const rsarrow_mt = new StandardMaterial("rsarrow-item-mt", scene);
    rsarrow_mt.diffuseColor = new Color3(0.2, 0.1, 0.1);
    ITEMSTATE.right_sub_arrow.material = rsarrow_mt;
}
function formatTextCtx(text: string, font_size: number, position: { x: number, y: number }, ctx: ICanvasRenderingContext) {
    ctx.save();
    ctx.font = `${font_size}px Arial`;
    ctx.translate(position.x, position.y);
    const measure_text = ctx.measureText(text);
    const text_pos_x = measure_text.width / 2;
    console.log(measure_text.width);
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
    ctx.fillStyle = "rgb(20,20,150)";
    ctx.fillRect(0, 0, 512, 512);
    //---------------------------------------------------
    formatTextCtx("Level:", 60, { x: 170, y:350 }, ctx)
    formatTextCtx(text, 150, { x: 200, y: 200 }, ctx);
    formatTextCtx("result: 1200", 40, { x: 160, y: 120 }, ctx);
    //-----------------------------------------------------------
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

