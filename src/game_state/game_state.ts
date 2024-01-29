import { createMap } from "@/level_builder/level_builder";
import { resetBall } from "@/objects/ball";
import { disposeEnemies } from "@/utils/utility";
import { AGAME } from "./main/state";

export const GameState = function _GameState() {
};
GameState.state = {
    gameState: 10,
    isDragShield: false,
    isBallStart: false,
    level: 1,
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
GameState.points = () => GameState.state.gameObjects.points;
GameState.playerProgress = (): Map<number, number> => GameState.state.playerProgress;
GameState.UI = () => GameState.state.ui;
//----------------------------------------------------------------------->

GameState.changeGameState = (state: number) => {
    GameState.state.gameState = state;
    GameState.signalReaction();
};
GameState.signalReaction = () => {
    switch (GameState.gameState()) {
        case GameState.state.signals.GAME_RUN: {
            console.log("GAMERUN");
            GameState.pipe(
                [                    
                    GameState.resetScene,
                    createMap,
                ]
            );

            break;
        }
        case GameState.state.signals.GAME_OTHER_BALL: {
            console.log("GAME_OTHER_BALL");
            GameState.pipe(
                [
                    GameState.resetScene,
                ]
            );
            break;
        }
        case GameState.state.signals.LEVEL_WIN: {
            console.log("LEVEL_WIN")
            GameState.pipe(
                [
                    GameState.resetScene,
                    GameState.nextLevel,
                ]
            )
            break;
        }
    }
}

GameState.resetScene = () => {
    GameState.state.isBallStart = false;
    resetBall();
    disposeEnemies();
    // GameState.playerProgress().set(GameState.state.level, 0);
    
}
GameState.pipe = (fnArr: Array<Function>) => {
    setTimeout(() => {
        fnArr.forEach(fn => fn());
    }, 500)
}
//----------------------------------------------->

GameState.calculatePoints = (enemy) => {
    const meta = enemy["meta"];
    const key = GameState.state.level;
    if (GameState.playerProgress().has(key)) {
        const points = GameState.playerProgress().get(key) + meta.points
        GameState.playerProgress().set(key, points);
    }
}
GameState.nextLevel = () => {
    GameState.state.level < 5 ?
        GameState.state.level += 1 :
        GameState.state.level = 1;
}
GameState.levelRun = () => {
    GameState.changeGameState(GameState.state.signals.GAME_RUN);
    AGAME.RenderLock = false;
}



