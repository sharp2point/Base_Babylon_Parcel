import { Camera, KeyboardInfo, Scene, Tools, UniversalCamera, Vector3 } from "@babylonjs/core";

export function cameraController(camera: UniversalCamera, scene: Scene) {

    scene.onKeyboardObservable.add((e: KeyboardInfo) => {
        switch (e.event.key) {
            case "m": {
                camera.fovMode = Camera.ORTHOGRAPHIC_CAMERA;
                break;
            }
            case "w": {
                camera.position.z += 0.1;
                console.log("CameraPosZ: ", camera.position.z)
                break;
            }
            case "s": {
                camera.position.z -= 0.1;
                console.log("CameraPosZ: ", camera.position.z)
                break;
            }
            case "a": {
                camera.position.y += 1;
                console.log("CameraPosY: ", camera.position.y)
                break;
            }
            case "d": {
                camera.position.y -= 1;
                console.log("CameraPosY: ", camera.position.y)
                break;
            }
            case "q": {
                camera.fov += Tools.ToRadians(1);
                console.log("CameraFOV: ", camera.fov)
                break;
            }
            case "e": {
                camera.fov -= Tools.ToRadians(1);
                console.log("CameraFOV: ", camera.fov)
                break;
            }
            case "z": {
                camera.setTarget(camera.getTarget().clone().add(new Vector3(0, 0, 0.1)))
                console.log("CameraTarget: ", camera.getTarget())
                break;
            }
            case "x": {
                camera.setTarget(camera.getTarget().clone().add(new Vector3(0, 0, -0.1)))
                console.log("CameraTarget: ", camera.getTarget())
                break;
            }
            case "c": {
                camera.setTarget(camera.getTarget().clone().add(new Vector3(0, 0.1, 0)))
                console.log("CameraTarget: ", camera.getTarget())
                break;
            }
            case "v": {
                camera.setTarget(camera.getTarget().clone().add(new Vector3(0, -0.1, 0)))
                console.log("CameraTarget: ", camera.getTarget())
                break;
            }
        }
    })
}