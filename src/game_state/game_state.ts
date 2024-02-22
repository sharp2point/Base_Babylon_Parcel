import { createMap } from "@/level_builder/level_builder";
import { resetBall } from "@/objects/ball";
import { disposeEnemies } from "@/utils/utility";
import { AGAME } from "./main/state";
import { UISTATE } from "./ui/state";
import { Observer, Scene } from "@babylonjs/core";
import { gameNotify } from "@/scenes/parts/notifyContainer";
import { showUILayout } from "@/ui/html/ui_components";
import { getMaxProgressForLevel, getResultsIDB, saveResultIDB } from "@/DB/indexdb";
import { GameResult } from "@/DB/sheme";
import Scoreboard from "@/ui/html/scoreboard";
import { Mesh } from "pixi.js";

export const GameState = function _GameState() {
};
GameState.state = {
    isFullScreen: false,
    lang: "ru",
    indexDB: {
        db: null as IDBDatabase,
        name: "NovaArcanoid",
        version: 1,
        store: "resultStore"
    },
    gameState: 10,
    isDragShield: false,
    isBallStart: false,
    isResetBall: false,
    level: 0,
    levelTimeHandler: null,
    levelTime: 0,
    enemyLight: null,
    stopRunTimer: null,
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
GameState.IDB = (): IDBDatabase => GameState.state.indexDB.db;
GameState.IDBobject = () => GameState.state.indexDB;
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
            GameState.state.stopRunTimer = runTimer();
            break;
        }
        case GameState.state.signals.GAME_OTHER_BALL: {
            GameState.state.stopRunTimer();
            console.log("GAME_OTHER_BALL");
            saveResultIDB({
                date: Date.now(),
                part: 1,
                level: GameState.state.level,
                isWin: false,
                score: GameState.playerProgress().get(GameState.state.level),
                time: GameState.state.levelTime,
            })
            gameNotify(GameState.state.signals.GAME_OTHER_BALL, {

            }, 3000).then(() => {
                GameState.resetScene();
                GameState.menuRun();
            });

            break;
        }
        case GameState.state.signals.LEVEL_WIN: {
            GameState.state.stopRunTimer();
            console.log("LEVEL_WIN");
            saveResultIDB({
                date: Date.now(),
                part: 1,
                level: GameState.state.level,
                isWin: true,
                score: GameState.playerProgress().get(GameState.state.level),
                time: GameState.state.levelTime,
            });
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
    renderTime(0);
    renderPoints(0);
    resetBall();
    disposeEnemies();
    GameState.state.isResetBall = false;
    GameState.state.isBallStart = false;
}
//----------------------------------------------->

GameState.calculatePoints = (enemy: Mesh) => {
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
    (UISTATE.UI.get("scoreboard") as Scoreboard).show = true;
    showUILayout(false);
    setTimeout(() => {
        (AGAME.Scene as Scene).attachControl();
    }, 600);
}
GameState.menuRun = () => {
    (AGAME.Scene as Scene).detachControl();
    AGAME.RenderLock = true;
    UISTATE.RenderLock = false;
    GameState.changeGameState(GameState.state.signals.MENU_OPEN);
    (UISTATE.UI.get("scoreboard") as Scoreboard).show = false;
    showUILayout(true);
    getMaxProgressForLevel(GameState.state.level);
    setTimeout(() => {
        (UISTATE.Scene as Scene).attachControl();
    }, 600);
}

//---------------------------------------------------
export function onRotateSpinMenu() {

}
export function runTimer() {
    let count = 60;
    let sec = 0;

    const obser$ = (AGAME.Scene as Scene).onBeforeRenderObservable.add(() => {
        count -= 1;
        if (count <= 0) {
            count = 60;
            sec += 1;
            GameState.state.levelTime = sec;
            renderTime(sec);
        }
    });
    return stopTimer(obser$)
}
function stopTimer(obser$: Observer<Scene>) {
    return () => {
        obser$.remove();
    }
}
const renderPoints = (points: number) => (UISTATE.UI.get("scoreboard") as Scoreboard).score = points;
const renderTime = (seconds: number) => (UISTATE.UI.get("scoreboard") as Scoreboard).timer = seconds;
export function redrawLevelProgress(data: GameResult) {
    if (data) {
        UISTATE.UI.get("progressScore").innerHTML = `${data.score}`.padStart(4, "0");
        UISTATE.UI.get("progressTime").innerHTML = `${data.time}`.padStart(4, "0");
    } else {
        UISTATE.UI.get("progressScore").innerHTML = `0000`;
        UISTATE.UI.get("progressTime").innerHTML = `0000`;
    }
}