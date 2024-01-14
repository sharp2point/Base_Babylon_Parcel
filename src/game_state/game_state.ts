import { addShadowToEnemy, enemy } from "@/objects/enemy/enemy";
import { AssetContainer, PhysicsHelper, TransformNode, Vector3 } from "@babylonjs/core";

export const GameState = function _GameState() {
}
GameState.state = {
    gameState: 10,
    isDragShield: false,
    isBallStart: false,
    dragBox: {
        up: -3,
        down: -7.5,
        left: -7,
        rigth: 7
    },
    gameObjects: {
        ball: null,
        shield: null,
        scene: null,
        shadow: null,
        physicsHelper: null,
    },
    physicsMaterial: {
        ball: { mass: 10, restitution: 0.5, friction: 0.01 },
        shield: { mass: 100, restitution: 0.5, friction: 0.1 },
        ground: { mass: 1000, restitution: 0.0, friction: 1 },
        wall: { mass: 1000, restitution: 0.5, friction: 0.0 },
        enemy: { mass: 10000, restitution: 0.5, friction: 1 }
    },
    sizes: {
        gameBox: { width: 17, height: 25 },
        enemy: 1,
        ball: 0.4
    },
    signals: {
        MENU_OPEN: 10,
        GAME_STOP: 101,
        GAME_RUN: 100,
        GAME_PAUSE: 102,
        GAME_OTHER_BALL: 400,
    },
    assets: {
        containers3D: new Map<string, AssetContainer>()
    },
    //--------------------------------------------------------->
    scene: () => GameState.state.gameObjects.scene,
    physicsHelper: () => GameState.state.gameObjects.physicsHelper,
    changeGameState: (state: number) => {
        GameState.state.gameState = state;
        console.log("Gane state Change")
    },
    createMap: (level: number) => {
        const enemy_node = new TransformNode("enemies-node", GameState.state.gameObjects.scene);

        const gap = GameState.state.sizes.enemy;
        const map_1 = [
            [0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0],
        ];
        for (let i = 0; i < map_1.length; i++) {
            for (let j = 0; j < map_1[i].length; j++) {
                switch (map_1[i][j]) {
                    case 1: {
                        enemy(`enemy-bloc-${j + 9 * i}`,
                            new Vector3(j * gap, GameState.state.sizes.enemy, i * gap).
                                add(new Vector3(-GameState.state.sizes.gameBox.width / 4, 0, 4)),
                            enemy_node);
                        addShadowToEnemy(GameState.state.gameObjects.shadow, `enemy-${j + 9 * i}`)
                        break;
                    }
                }
            }
        }
    }
}