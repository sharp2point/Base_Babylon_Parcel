import { GameState } from "@/game_state/game_state";
import { Color3, HemisphericLight, Mesh, TransformNode, Vector3 } from "@babylonjs/core";
import { LevelMaps } from "./levels";
import { addShadowToEnemy, enemy } from "@/objects/enemy/enemy";

export function createMap(light: HemisphericLight) {
    const lmap = LevelMaps[GameState.state.level];
    GameState.state.gameObjects.enemyNodes = new TransformNode("enemies-node", GameState.scene());

    const gap = GameState.state.sizes.enemy;

    const enemies = new Array<Mesh>();

    const deltaX = lmap[0].length / 2
    for (let i = 0; i < lmap.length; i++) {
        for (let j = 0; j < lmap[i].length; j++) {
            switch (lmap[i][j]) {
                case 1: {
                    const name = `enemy-bloc-${j + 9 * i}`;
                    const emesh = enemy(name,
                        new Vector3(
                            j * gap,
                            GameState.state.sizes.enemy / 2, i * gap).add(
                                new Vector3(
                                    -(deltaX),
                                    0,
                                    GameState.gameBox().height / 2 - 10
                                )
                            ),
                        GameState.state.gameObjects.enemyNodes);

                    addShadowToEnemy(GameState.state.gameObjects.shadow, name);
                    enemies.push(emesh);
                    break;
                }
            }
        }
    }

    // light.includedOnlyMeshes = enemies;
};