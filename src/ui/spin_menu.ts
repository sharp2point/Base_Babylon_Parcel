import { Animation, BezierCurveEase, CircleEase, DynamicTexture, EasingFunction, Mesh, MeshBuilder, Scene, StandardMaterial, Tools, TransformNode, Vector3 } from "@babylonjs/core";

export const SPINMENUSTATE = {
    positions: 12,
    diameter: 10,
    item_size: {
        width: 4,
        height: 4
    },
    angle: null,
    node: null,
    start_item: 0,
    items: new Map<string, number>(),
    prefix_item: `menu-item-`,
    deltaZ: 90
}

export function spinMenu(position: Vector3, scene: Scene) {
    SPINMENUSTATE.angle = 360 / SPINMENUSTATE.positions;

    SPINMENUSTATE.node = new TransformNode("menu-rotate-tn", scene);
    const item = MeshBuilder.CreateBox("menu-item", {
        width: 0.1, height: SPINMENUSTATE.item_size.height,
        depth: SPINMENUSTATE.item_size.width
    }, scene);
    item.isVisible = false;
    item.isEnabled(false);

    [...Array(SPINMENUSTATE.positions).keys()].forEach((i) => {
        const name = `${SPINMENUSTATE.prefix_item}${i}`;
        const angle = Tools.ToRadians(i * SPINMENUSTATE.angle);
        SPINMENUSTATE.items.set(name, i * SPINMENUSTATE.angle);

        const itm = newItemMenu(item, {
            name: name,
            rotation: angle,
            position: new Vector3(
                position.x + Math.cos(angle) * SPINMENUSTATE.diameter,
                position.y + Math.sin(angle) * SPINMENUSTATE.diameter,
                position.z)
        }, scene)
        appendMaterialItemMenu(itm, `${i}`, scene);
        itm.setParent(SPINMENUSTATE.node);
    });
    SPINMENUSTATE.node.position = position.add(new Vector3(0, 5, 0));
    return SPINMENUSTATE.node;
}
export function spinMenuByIndexItem(itemIndex: number) {
    const index = itemIndex % SPINMENUSTATE.positions;
    const angle = SPINMENUSTATE.items.get(`${SPINMENUSTATE.prefix_item}${index}`);
    spinMenuOnAngle(angle + SPINMENUSTATE.deltaZ);
}
export function getItemOnPointerDown(name: string) {
    console.log(name, "-> angle: ", SPINMENUSTATE.items.get(name));
}
function newItemMenu(base: Mesh, options: { name: string, rotation: number, position: Vector3 }, scene: Scene) {
    const itm = base.clone(options.name, null, true, false);
    itm.isPickable = true;
    itm.rotation.z = options.rotation;
    itm.position = options.position;
    itm.isVisible = true;
    itm.isEnabled(true);
    return itm;
}
function appendMaterialItemMenu(item: Mesh, text: string, scene: Scene) {
    const texture_width = 256;
    const texture_height = 256;
    const font_size = 100;
    const font = `${font_size}px Arial, serif`;

    const txt = new DynamicTexture("item-menu-txt", { width: texture_width, height: texture_height }, scene);
    const ctx = txt.getContext();
    ctx.font = font;
    const measure_text = ctx.measureText(text);
    const text_width = measure_text.width;
    const text_pos_x = texture_width / 2 - text_width / 2;
    const text_pos_y = texture_height / 2 + font_size / 4;

    txt.drawText(text, text_pos_x, text_pos_y, font, "rgba(255,255,200,1)", "rgba(20,25,20,0.5)", true, true);
    const material = new StandardMaterial("round-menu-mt", scene);
    material.diffuseTexture = txt;
    material.alpha = 1;

    item.material = material;

}
function spinMenuOnAngle(angle: number, is_add: boolean = false) {
    if (is_add) {
        SPINMENUSTATE.node.rotation.z += Tools.ToRadians(angle);
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
    const easingFunction = new BezierCurveEase(0.0, -0.06, 1, -0.1);
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    const anim = new Animation("spin-menu-anim", "rotation.z", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    anim.setEasingFunction(easingFunction);
    anim.setKeys(keys);
    node.animations.push(anim);
    scene.beginAnimation(node, 0, 60, false, 1);

}

