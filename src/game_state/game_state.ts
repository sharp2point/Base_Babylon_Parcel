import { resetBall } from "@/objects/ball";
import { addShadowToEnemy, enemy } from "@/objects/enemy/enemy";
import { gameObjectDispose } from "@/utils/utility";
import { AssetContainer, Camera, Mesh, PhysicsBody, PhysicsHelper, Scene, TransformNode, Vector3 } from "@babylonjs/core";


export const GameState = function _GameState() {
};
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
        enemyNodes: null,
        damageNodes: null,
        camera: null,
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
        LEVEL_WIN: 200,
        GAME_OTHER_BALL: 400,
        GAME_OTHER_TIME: 420,
    },
    assets: {
        containers3D: new Map<string, AssetContainer>()
    },
};
//---- ACCSESSORS---------------------------->
GameState.scene = (): Scene => GameState.state.gameObjects.scene;
GameState.camera = (): Camera => GameState.state.gameObjects.camera;
GameState.physicsHelper = (): PhysicsHelper => GameState.state.gameObjects.physicsHelper;
GameState.enemyNodes = (): TransformNode => GameState.state.gameObjects.enemyNodes;
GameState.damageNodes = (): Array<TransformNode> => GameState.state.gameObjects.damageNodes;
GameState.gameState = (): number => GameState.state.gameState;
GameState.ball = (): Mesh => GameState.state.gameObjects.ball;
//----------------------------------------------------------------------->

GameState.changeGameState = (state: number) => {
    GameState.state.gameState = state;
    GameState.signalReaction();
};
GameState.createMap = (level: number) => {
    GameState.state.gameObjects.enemyNodes = new TransformNode("enemies-node", GameState.state.gameObjects.scene);

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
                        GameState.state.gameObjects.enemyNodes);
                    addShadowToEnemy(GameState.state.gameObjects.shadow, `enemy-${j + 9 * i}`)
                    break;
                }
            }
        }
    }
};
GameState.signalReaction = () => {
    switch (GameState.gameState()) {
        case GameState.state.signals.MENU_OPEN: {
            console.log("MENU_OPEN")
            GameState.resetScene();
            GameState.menuOpen();
            break;
        }
        case GameState.state.signals.GAME_RUN: {
            console.log("GAMERUN")
            GameState.resetScene();
            GameState.menuClose();
            break;
        }
        case GameState.state.signals.GAME_OTHER_BALL: {
            console.log("GAME_OTHER_BALL")
            GameState.resetScene();
            GameState.menuOpen();
            break;
        }
        case GameState.state.signals.LEVEL_WIN: {
            console.log("LEVEL_WIN")
            GameState.resetScene();
            GameState.menuOpen();
            break;
        }
    }
}
GameState.menuOpen = () => {
    globalThis.renderLock = true;
    const menu = document.querySelector(".menu");
    menu.classList.remove("hide");
}
GameState.menuClose = () => {
    globalThis.renderLock = false;
    const menu = document.querySelector(".menu");
    menu.classList.add("hide");
}
GameState.resetScene = () => {
    GameState.state.isBallStart = false;
    resetBall();
    GameState.disposeEnemies();
    GameState.createMap(1);
}
//----------------------------------------------->
GameState.isAllEnemiesDie = () => {
    return (GameState.enemyNodes() as TransformNode).getChildren().length > 0 ? false : true;
}
GameState.menuCreate = () => {
    const menu_place = document.createElement('div');
    menu_place.classList.add('game-menu');
    menu_place.innerHTML += `<div class="menu">
        <h1> Arcanoid 3D </h1>
        <button class="bt play-bt">Play</button>
    </div>`;
    document.body.appendChild(menu_place);
    const playButton = document.querySelector(".play-bt");
    playButton.addEventListener('click', () => {
        GameState.changeGameState(GameState.state.signals.GAME_RUN);// GAME_RUN: 100
    })
}
GameState.disposeEnemies = () => {
    GameState.damageNodes().forEach(tn => {
        tn.getChildren().forEach(obj => {
            gameObjectDispose(obj as Mesh);
        })
    })
    GameState.enemyNodes().getChildren().forEach(obj => {
        gameObjectDispose(obj as Mesh);
    })
}

