import { Vector3, Mesh, SceneLoader, Scene, InstantiatedEntries } from "@babylonjs/core";
import "@babylonjs/loaders";

let assetContainer = null;

let loadPromise = async (rootPath: string, fileName: string, scene: Scene) => {
  return new Promise((res, rej) => {
    SceneLoader.LoadAssetContainer(rootPath, fileName, scene, function (container) {
      res(container);
    });
  });
}
let mergeMeshes = (model: InstantiatedEntries) => {
  const mesh = Mesh.MergeMeshes(model.rootNodes[0].getChildMeshes(), true, false, null, null, true);
  mesh.scaling = new Vector3(1, 1, 1);
  mesh.position = new Vector3(0, 0, 0);
  return mesh;
}
async function loadToAssetContainer(rootPath, fileName, scene) {
  if (assetContainer === null) {
    assetContainer = await loadPromise(rootPath, fileName, scene);
  }
  return assetContainer;
}

export { loadToAssetContainer, mergeMeshes };