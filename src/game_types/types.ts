import { Color3, Mesh, Scene, StandardMaterial, Vector3 } from "@babylonjs/core"

export type gmSize = {
    width: number,
    height: number,
    depth:number
}
export type gmPosition = {
    x: number,
    y: number,
    z: number
}

export type gmStdMaterialFn = (mesh: Mesh, options: gmStdMaterialOpt, scene: Scene) => void;

export type gmPhysicsFn = (mesh: Mesh, scene: Scene) => void;

export type gmStdMaterialOpt = {
    diffuse: Color3
}
