import { GameState } from "@/game_state/game_state";
import { Vector3, Mesh, SceneLoader, Scene, InstantiatedEntries, AssetContainer } from "@babylonjs/core";
import "@babylonjs/loaders";

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
async function loadToAssetContainer(rootPath: string, fileName: string, scene: Scene) {
  const container = await loadPromise(rootPath, fileName, scene);
  return container;
}

async function loadModel(rootPath: string, fileName: string, scene: Scene) {
  const container = await loadToAssetContainer(rootPath, fileName, scene);
  return container;
}
function instateMesh(nameMesh: string, assetContainer: AssetContainer) {
  const instanceModel = assetContainer.instantiateModelsToScene(() => nameMesh, true)
  const mesh = mergeMeshes(instanceModel);
  return mesh;
}
//---------------------------------------------------------------------->
export function load3DModels() {
  loadDamageEnemyModel();
}
function loadDamageEnemyModel() {
  loadModel(`public/models/`, `damage.glb`, GameState.state.gameObjects.scene).then((container) => {
    GameState.state.assets.containers3D.set("enemy_damage", container as AssetContainer);
  })
}
export { loadToAssetContainer, mergeMeshes, loadModel, instateMesh };