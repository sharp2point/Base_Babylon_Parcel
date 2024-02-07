import { createMap } from "@/level_builder/level_builder";
import { resetBall } from "@/objects/ball";
import { disposeEnemies } from "@/utils/utility";
import { AGAME } from "./main/state";
import { UISTATE } from "./ui/state";
import { Scene } from "@babylonjs/core";
import { gameNotify } from "@/scenes/parts/notifyContainer";

export const GameState = function _GameState() {
};
GameState.state = {
    gameState: 10,
    isDragShield: false,
    isBallStart: false,
    isResetBall: false,
    level: 0,
    levelTimeHandler: null,
    levelTime: 0,
    enemyLight: null,
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
        shield_node: null,
        shield_body: null,
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
    ui: {
        init_screen: null,
        score_board: {
            size: {
                width: 500,
                height: 100,
            }
        }
    },
    playerProgress: new Map<number, number>()
};
//---- ACCSESSORS---------------------------->
GameState.scene = () => GameState.state.gameObjects.scene;
GameState.camera = () => GameState.state.gameObjects.camera;
GameState.gameBox = () => GameState.state.sizes.gameBox;
GameState.enemyNodes = () => GameState.state.gameObjects.enemyNodes;
GameState.damageNodes = () => GameState.state.gameObjects.damageNodes;
GameState.gameState = (): number => GameState.state.gameState;
GameState.ball = () => GameState.state.gameObjects.ball;
GameState.shieldNode = () => GameState.state.gameObjects.shield_node;
GameState.shieldBody = () => GameState.state.gameObjects.shield_body;
GameState.points = () => GameState.state.gameObjects.points;
GameState.playerProgress = (): Map<number, number> => GameState.state.playerProgress;
GameState.UI = () => GameState.state.ui;
//----------------------------------------------------------------------->

GameState.changeGameState = (state: number) => {
    GameState.state.gameState = state;
    switch (GameState.gameState()) {
        case GameState.state.signals.MENU_OPEN: {
            console.log("MENUOPEN");
            break;
        }
        case GameState.state.signals.GAME_RUN: {
            console.log("GAMERUN");
            GameState.resetScene();
            createMap(GameState.state.enemyLight);
            break;
        }
        case GameState.state.signals.GAME_OTHER_BALL: {
            console.log("GAME_OTHER_BALL");
            gameNotify(GameState.state.signals.GAME_OTHER_BALL, {

            }, 3000).then(() => {
                GameState.resetScene();
                GameState.menuRun();
            });

            break;
        }
        case GameState.state.signals.LEVEL_WIN: {
            console.log("LEVEL_WIN");
            gameNotify(GameState.state.signals.LEVEL_WIN, {

            }, 3000).then(() => {
                GameState.resetScene();
                GameState.menuRun();
            });

            break;
        }
    }
};
GameState.resetScene = () => {
    renderPoints(0);
    resetBall();
    disposeEnemies();
    GameState.state.isResetBall = false;
    GameState.state.isBallStart = false;
}
//----------------------------------------------->

GameState.calculatePoints = (enemy) => {
    const meta = enemy["meta"];
    const key = GameState.state.level;
    if (GameState.playerProgress().has(key)) {
        const points = GameState.playerProgress().get(key) + meta.points
        GameState.playerProgress().set(key, points);
        renderPoints(points);
    }
}
GameState.levelRun = (level: number) => { // level -> binding from spin menu
    (UISTATE.Scene as Scene).detachControl();
    AGAME.RenderLock = false;
    UISTATE.RenderLock = true;
    GameState.state.level = level;
    GameState.playerProgress().set(level, 0);
    GameState.changeGameState(GameState.state.signals.GAME_RUN);
    showPoints(true);
    setTimeout(() => {
        (AGAME.Scene as Scene).attachControl();
    }, 600);
}
GameState.menuRun = () => {
    (AGAME.Scene as Scene).detachControl();
    AGAME.RenderLock = true;
    UISTATE.RenderLock = false;
    GameState.changeGameState(GameState.state.signals.MENU_OPEN);
    showPoints(false);
    setTimeout(() => {
        (UISTATE.Scene as Scene).attachControl();
    }, 600);
}
//---------------------------------------------------
function renderPoints(points: number) {
    const res = `${points}`.padStart(4, '0');
    (UISTATE.Scoreboard.score as HTMLElement).innerText = res;
}
function showPoints(isShow: boolean) {
    const scoreboard = document.querySelector(".scoreboard");
    isShow ?
        scoreboard.classList.remove('hide') :
        scoreboard.classList.add('hide');
}



