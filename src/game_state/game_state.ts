import { createMap } from "@/level_builder/level_builder";
import { resetBall } from "@/objects/ball";
import { clearScene } from "@/utils/utility";
import { AGAME } from "./main/state";
import { UISTATE } from "./ui/state";
import { HemisphericLight, Mesh, Observer, Scene, TransformNode, UniversalCamera } from "@babylonjs/core";
import { gameNotify } from "@/scenes/parts/notifyContainer";
import { showUILayout } from "@/ui/html/ui_components";
import { getMaxProgressForLevel, saveResultIDB } from "@/DB/indexdb";
import { GameResult } from "@/DB/sheme";
import Scoreboard from "@/ui/html/scoreboard";
import Progressboard from "@/ui/html/progressboard";
import PlayControl from "@/ui/html/playcontrol";

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
    enemyLight: null as HemisphericLight,
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
        enemy: null as Mesh,
        enemyDamage: null as Array<Mesh>,
        scene: null,
        shadow: null,
        physicsHelper: null,
        enemyNodes: null,
        damageNodes: null,
        camera: null,
        points: null,
        bonus: null as Mesh,
        bonuses: new Array<Mesh>(),
        effects: new Array<Mesh>()
    },
    collideMask: {
        shield: 0b00000001,
        ball: 0b00000010,
        enemy: 0b00000100,
        enemyParts: 0b00001000,
        rocket: 0b00010000,
        ground: 0b00100000,
        bombParts: 0b01000000,
        groups: {
            shield: 0b00000010,
            ball: 0b00101101,
            enemy: 0b01111110,
            rocket: 0b00000100,
            enemyParts: 0b00100110,
            bombParts: 0b00100100,
            ground: 0b01111111,
        }
    },
    physicsMaterial: {
        ground: { mass: 100000, restitution: 0.0, friction: 1 },
        wall: { mass: 100000, restitution: 1, friction: 0.0 },
        enemy: { mass: 300, restitution: 0.25, friction: 0.5 }
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
GameState.scene = (): Scene => GameState.state.gameObjects.scene;
GameState.camera = (): UniversalCamera => GameState.state.gameObjects.camera;
GameState.gameBox = () => GameState.state.sizes.gameBox;
GameState.damageNodes = () => GameState.state.gameObjects.damageNodes;
GameState.gameState = (): number => GameState.state.gameState;
GameState.ball = () => GameState.state.gameObjects.ball;
GameState.shieldNode = () => GameState.state.gameObjects.shield_node;
GameState.shieldBody = () => GameState.state.gameObjects.shield_body;
GameState.points = () => GameState.state.gameObjects.points;
GameState.playerProgress = (): Map<number, number> => GameState.state.playerProgress;
GameState.IDB = (): IDBDatabase => GameState.state.indexDB.db;
GameState.IDBobject = () => GameState.state.indexDB;
GameState.EnemyNode = (): TransformNode => GameState.state.gameObjects.enemyNodes;
GameState.Bonuses = (): Array<Mesh> => GameState.state.gameObjects.bonuses;
GameState.Effects = (): Array<Mesh> => GameState.state.gameObjects.effects;
GameState.CldMasks = () => GameState.state.collideMask;
//----------------------------------------------------------------------->
GameState.changeGameState = (state: number) => {
    GameState.state.gameState = state;
    switch (GameState.gameState()) {
        case GameState.state.signals.MENU_OPEN: {
            break;
        }
        case GameState.state.signals.GAME_RUN: {
            GameState.state.enemyLight.setEnabled(true);
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
    clearScene();
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
    (UISTATE.UI.get("levelMenu") as HTMLElement).style.visibility = "visible";
    (UISTATE.UI.get("playControl") as PlayControl).exitEvent = onExitButtomMenu;
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
    (UISTATE.UI.get("levelMenu") as HTMLElement).style.visibility = "hidden";
    showUILayout(true);
    getMaxProgressForLevel(GameState.state.level);
    setTimeout(() => {
        (UISTATE.Scene as Scene).attachControl();
    }, 600);
}

//---------------------------------------------------

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
function onExitButtomMenu() {
    GameState.state.stopRunTimer();
    GameState.menuRun();
}
const renderPoints = (points: number) => (UISTATE.UI.get("scoreboard") as Scoreboard).score = points;
const renderTime = (seconds: number) => (UISTATE.UI.get("scoreboard") as Scoreboard).timer = seconds;
export function redrawLevelProgress(data: GameResult) {
    if (data) {
        (UISTATE.UI.get("progress") as Progressboard).score = data.score;
        (UISTATE.UI.get("progress") as Progressboard).timer = data.time;
    } else {
        (UISTATE.UI.get("progress") as Progressboard).score = 0;
        (UISTATE.UI.get("progress") as Progressboard).timer = 0;
    }
}