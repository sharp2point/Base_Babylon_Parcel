import { resetBall } from "@/objects/ball";
import { addShadowToEnemy, enemy } from "@/objects/enemy/enemy";
import { gameObjectDispose } from "@/utils/utility";
import { AssetContainer, Camera, Mesh, PhysicsHelper, Scene, Tools, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";


export const AGAME = {
    HavokPhysics: null,
    HVK: null,
    Canvas: null,
    Engine: null,
    Gravity: null,
    Scene: null,
    ScreenAspect: null,
    RenderLock: true,
}

export const GameState = function _GameState() {
};
GameState.state = {
    gameState: 10,
    isDragShield: false,
    isBallStart: false,
    level: 5,
    levelTimeHandler: null,
    levelTime: 0,
    dragBox: {
        up: -5,
        down: -10.0,
        left: -8.5,
        rigth: 8.5
    },
    gameObjects: {
        globalTransformNode: null,
        worldNode: null,
        ball: null,
        shield: null,
        scene: null,
        shadow: null,
        physicsHelper: null,
        enemyNodes: null,
        damageNodes: null,
        camera: null,
        points: null,
    },
    physicsMaterial: {
        ball: { mass: 10, restitution: 1, friction: 0.1 },
        shield: { mass: 100, restitution: 0.5, friction: 0.1 },
        ground: { mass: 1000, restitution: 0.0, friction: 1 },
        wall: { mass: 1000, restitution: 0.5, friction: 0.0 },
        enemy: { mass: 1000, restitution: 1, friction: 1 }
    },
    sizes: {
        gameBox: { width: 18, height: 40 },
        enemy: 1,
        ball: 0.6
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
        sprites: new Map<string, HTMLImageElement>(),
        containers3D: new Map<string, AssetContainer>()
    },
    playerProgress: new Map<number, number>()
};
//---- ACCSESSORS---------------------------->
GameState.scene = (): Scene => GameState.state.gameObjects.scene;
GameState.GTN = (): TransformNode => GameState.state.gameObjects.globalTransformNode;
GameState.camera = (): Camera => GameState.state.gameObjects.camera;
GameState.gameBox = () => GameState.state.sizes.gameBox;
GameState.physicsHelper = (): PhysicsHelper => GameState.state.gameObjects.physicsHelper;
GameState.enemyNodes = (): TransformNode => GameState.state.gameObjects.enemyNodes;
GameState.damageNodes = (): Array<TransformNode> => GameState.state.gameObjects.damageNodes;
GameState.gameState = (): number => GameState.state.gameState;
GameState.ball = (): Mesh => GameState.state.gameObjects.ball;
GameState.points = (): Mesh => GameState.state.gameObjects.points;
GameState.sprites = (): Map<string, HTMLImageElement> => GameState.state.assets.sprites;
GameState.playerProgress = (): Map<number, number> => GameState.state.playerProgress;
//----------------------------------------------------------------------->

GameState.changeGameState = (state: number) => {
    GameState.state.gameState = state;
    GameState.signalReaction();
};
GameState.createMap = (level: number) => {
    GameState.state.gameObjects.enemyNodes = new TransformNode("enemies-node", GameState.state.gameObjects.scene);

    const gap = GameState.state.sizes.enemy;
    const maps = {
        1: [
            [0, 0, 1, 0, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        2: [
            [0, 1, 0, 0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0],
        ],
        3: [
            [0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 0],
        ],
        4: [
            [0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0],
        ],
        5: [
            [0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
            [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
            [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1],
            [0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],

        ],
    };
    const deltaX = maps[level][0].length / 2
    for (let i = 0; i < maps[level].length; i++) {
        for (let j = 0; j < maps[level][i].length; j++) {
            switch (maps[level][i][j]) {
                case 1: {
                    const emesh = enemy(`enemy-bloc-${j + 9 * i}`,
                        new Vector3(j * gap, GameState.state.sizes.enemy, i * gap).
                            add(new Vector3(-(deltaX), 0, GameState.gameBox().height / 2 - 10)),
                        GameState.state.gameObjects.enemyNodes);
                    addShadowToEnemy(GameState.state.gameObjects.shadow, `enemy-${j + 9 * i}`);
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
            GameState.menuOpen();
            GameState.resetScene();
            break;
        }
        case GameState.state.signals.GAME_RUN: {
            console.log("GAMERUN");
            GameState.clearLevelTime();
            GameState.menuClose();
            GameState.resetScene();
            GameState.initLevelTime();
            break;
        }
        case GameState.state.signals.GAME_OTHER_BALL: {
            console.log("GAME_OTHER_BALL");
            GameState.clearLevelTime();
            GameState.menuOpen();
            GameState.resetScene();
            break;
        }
        case GameState.state.signals.LEVEL_WIN: {
            console.log("LEVEL_WIN")
            GameState.state.level < 5 ?
                GameState.state.level += 1 :
                GameState.state.level = 1;
            GameState.clearLevelTime();
            GameState.menuOpen();
            GameState.resetScene();
            break;
        }
    }
}
GameState.menuOpen = () => {
    AGAME.RenderLock = true;
    const game_menu = document.querySelector(".game-menu");
    game_menu.classList.remove("hide");
    let progress = '';
    GameState.playerProgress().forEach((v, k) => {
        progress += `<div class="level"><span>level ${k}:</span><span>${v}</span> </div>`
    });
    const stat = document.querySelector(".play-progress");
    stat.innerHTML = progress;
}
GameState.menuClose = () => {
    AGAME.RenderLock = false;
    const game_menu = document.querySelector(".game-menu");
    game_menu.classList.add("hide");
}
GameState.resetScene = () => {
    GameState.state.isBallStart = false;
    resetBall();
    GameState.disposeEnemies();
    GameState.playerProgress().set(GameState.state.level, 0);
    GameState.createMap(GameState.state.level);
}
//----------------------------------------------->
GameState.isAllEnemiesDie = () => {
    return (GameState.enemyNodes() as TransformNode).getChildren().length > 0 ? false : true;
}
GameState.menuCreate = () => {
    const menu_place = document.createElement('div');
    menu_place.classList.add('game-menu');

    const level_menu = document.createElement('div');
    level_menu.classList.add("level-menu");
    document.body.appendChild(level_menu);

    level_menu.innerHTML = `<span class="level-menu-timer">0</span>`

    menu_place.innerHTML += `<div class="menu">
        <button class="bt play-bt">Play</button>
        <div class="play-progress">
        </div>
    </div>`;
    document.body.appendChild(menu_place);
    const playButton = document.querySelector(".play-bt");
    playButton.addEventListener('click', () => {
        GameState.changeGameState(GameState.state.signals.GAME_RUN);// GAME_RUN: 100
    })
}
GameState.disposeEnemies = () => {
    if (GameState.damageNodes().length > 0) {
        GameState.damageNodes().forEach(tn => {
            tn.getChildren().forEach(obj => {
                gameObjectDispose(obj as Mesh);
            })
        })
    }
    if (GameState.enemyNodes()?.getChildren() && GameState.enemyNodes().getChildren().length > 0) {
        GameState.enemyNodes().getChildren().forEach(obj => {
            gameObjectDispose(obj as Mesh);
        })
    }
}
GameState.calculatePoints = (enemy: Mesh) => {
    const meta = enemy["meta"];
    const key = GameState.state.level;
    if (GameState.playerProgress().has(key)) {
        const points = GameState.playerProgress().get(key) + meta.points
        GameState.playerProgress().set(key, points);
        //----------------------------------------->
        const points_menu = document.querySelector(".level-menu-timer");
        points_menu.innerHTML = `${points}`;
    }
}
GameState.initLevelTime = () => {

}
GameState.clearLevelTime = () => {
    const points_menu = document.querySelector(".level-menu-timer");
    points_menu.innerHTML = `0`;
}
GameState.cameraSettings = () => {
    console.log("AP: ", AGAME.ScreenAspect);
    const camera = GameState.camera() as UniversalCamera;
    if (AGAME.ScreenAspect >= 0.40 && AGAME.ScreenAspect < 0.45) {
        camera.position = new Vector3(0, 15.5, -4);
        camera.target = new Vector3(0, -1, 3);
        camera.fov = camera.fov = Tools.ToRadians(120);
    } else if (AGAME.ScreenAspect >= 0.45 && AGAME.ScreenAspect < 0.5) {
        camera.position = new Vector3(0, 14, -4);
        camera.target = new Vector3(0, 0, 0);
        camera.fov = camera.fov = Tools.ToRadians(117);
    } else if (AGAME.ScreenAspect >= 0.5 && AGAME.ScreenAspect < 0.55) {
        camera.position = new Vector3(0, 13, -4);
        camera.target = new Vector3(0, 0, 0);
        camera.fov = camera.fov = Tools.ToRadians(115);
    } else if (AGAME.ScreenAspect >= 0.55 && AGAME.ScreenAspect < 0.6) {
        camera.position = new Vector3(0, 13, -4);
        camera.target = new Vector3(0, 0, 0);
        camera.fov = camera.fov = Tools.ToRadians(115);
    } else if (AGAME.ScreenAspect >= 0.6 && AGAME.ScreenAspect < 0.65) {
        camera.position = new Vector3(0, 13, -4);
        camera.target = new Vector3(0, 0, 0);
        camera.fov = camera.fov = Tools.ToRadians(115);
    } else if (AGAME.ScreenAspect >= 0.65 && AGAME.ScreenAspect < 0.7) {
        camera.position = new Vector3(0, 11.5, -4);
        camera.target = new Vector3(0, 0, 0);
        camera.fov = camera.fov = Tools.ToRadians(115);
    } else if (AGAME.ScreenAspect >= 0.7 && AGAME.ScreenAspect < 0.75) {
        camera.position = new Vector3(0, 11, -4);
        camera.target = new Vector3(0, 0, 0);
        camera.fov = camera.fov = Tools.ToRadians(115);
    } else if (AGAME.ScreenAspect >= 0.75 && AGAME.ScreenAspect < 1) {
        camera.position = new Vector3(0, 11, -4);
        camera.target = new Vector3(0, 0, 0);
        camera.fov = Tools.ToRadians(115);
    } else if (AGAME.ScreenAspect >= 1) {
        camera.position = new Vector3(0, 15, -10);
        camera.target = Vector3.Zero();
        camera.fov = Tools.ToRadians(80);
    }
}

