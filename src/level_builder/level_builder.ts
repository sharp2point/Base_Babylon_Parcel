import { GameState } from "@/game_state/game_state";
import { HemisphericLight, Mesh, Scalar, Tools, TransformNode, Vector3 } from "@babylonjs/core";
import { addBonus, addShadowToEnemy, enemy } from "@/objects/enemy/enemy";
import { animationGLBBlock } from "./blocks";
import { LevelMaps } from "./maps/maps_node";
import { BuildsMap } from "./maps/maps_building";
import { EnemyPositionMap } from "./maps/maps_posnode";
import { randomInt } from "../utils/utility";

// 311045 --> count_height: 3,type: 110,angle: 45

export function createMap(light: HemisphericLight) {
    // Enemy Map -------------------------------------
    const enemies = createMapEnemy(GameState.state.level);
    //--- Builds --------------------------------------
    const builds = createBuilds(GameState.state.level)
    //--- Enemy Position ------------------------------
    const posEnemies = createPositionEnemy(GameState.state.level)
    // Shadow ----------------------
    light.includedOnlyMeshes = [...enemies, ...builds, ...posEnemies];
};
//-----------------------------------------------------

function createMapEnemy(level: number) {
    const enemy_map = LevelMaps[level];
    const tn = new TransformNode("enemies-node", GameState.scene());
    const gap = GameState.state.sizes.enemy;
    const enemies = new Array<Mesh>();
    const deltaX = enemy_map[0].length / 2 - 0.5;
    const deltaZ = -18;
    for (let i = 0; i < enemy_map.length; i++) {
        for (let j = 0; j < enemy_map[i].length; j++) {
            const name = `enemy-bloc-${j + 9 * i}`;
            const position = new Vector3(j * gap,
                GameState.state.sizes.enemy / 2, i * gap).add(new Vector3(-(deltaX), 0, GameState.gameBox().height / 2 + deltaZ)
                );
            if (!enemy_map[i][j]) {
                continue;
            }
            const data = parseCellMap(enemy_map[i][j])
            let count = data.count
            let deltaY = 0
            while (count) {
                const new_position = position.add(new Vector3(0, deltaY, 0));
                let emesh = enemySelector(name, { enemy_type: data.type, position: new_position, angle: data.angle });
                if (emesh) {
                    addShadowToEnemy(GameState.state.gameObjects.shadow, name);
                    enemies.push(emesh);
                    emesh.setParent(tn);
                }

                appendEnemyBonus(emesh);
                deltaY += 1.3;
                count--;
            }
        }
    }
    GameState.state.gameObjects.enemyNodes = tn;

    return enemies;
}
function createBuilds(level: number) {
    const builds = new Array<Mesh>();
    const builds_map = BuildsMap[level];
    builds_map.forEach((build) => {
        switch (build.type) {
            case 200: {
                builds.push(animationGLBBlock(`static-enemy-bloc-200`, { type: 200, position: build.position }, GameState.EnemyNode()));
                break;
            }
        }
    });
    return builds;
}
function createPositionEnemy(level: number) {
    const enemies = new Array<Mesh>();
    const enemy_pos_map = EnemyPositionMap[level];
    enemy_pos_map.forEach((e) => {
        let height = e.height;
        let deltaY = 0;
        while (height) {
            const new_position = e.position.add(new Vector3(0, deltaY, 0));
            enemies.push(enemy(`enemy-bloc-${e.type}`, { type: e.type, position: new_position, angle: e.angle }, GameState.EnemyNode()));
            deltaY += 1.3;
            height--;
        }
    });
    return enemies;
}
function parseCellMap(item: number) {
    const full = `${item}`.padStart(4, '0').padEnd(6, '0');
    const count = full[0]; // колличество элементов в высоту
    const type = full.slice(1, 4); // тип элемента
    const angle = full.slice(4, 6); // угол поворота в градусах
    return {
        count: parseInt(count),
        type: parseInt(type),
        angle: parseInt(angle)
    }
}
function enemySelector(name: string, options: { enemy_type: number, position: Vector3, angle: number }): Mesh {
    switch (options.enemy_type) {
        case 110:
        case 125:
        case 150: {
            return enemy(name, { type: options.enemy_type, position: options.position, angle: options.angle }, GameState.EnemyNode());
        }
        default: {
            return null;
        }
    }
}
function appendEnemyBonus(enemy: Mesh) {
    const rnd = Math.trunc(Scalar.RandomRange(0, 5));
    switch (rnd) {
        case 1: {
            addBonus(enemy, 100, 1);//bomb
            break;
        }
        case 2: {
            addBonus(enemy, 300, randomInt(5, 50));//coin
            break;
        }
        case 3: {
            addBonus(enemy, 300, randomInt(1, 3));//rocket
            break;
        }
        case 4: {
            addBonus(enemy, 100, randomInt(1, 5));//time
            break;
        }
        default: {
            //console.log("Zero bonus");
        }
    }

}

