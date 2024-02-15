import { GameState } from "@/game_state/game_state";
import { Scene } from "@babylonjs/core";


export function gameNotify(state: number, options: {

}, timeout: number) {
    switch (state) {
        case GameState.state.signals.LEVEL_WIN: {
            const notifyContainer = notyfyContainer();
            notifyContainer.appendChild(youWin2D());
            const parent = parentUI();
            parent.appendChild(notifyContainer);
            break;
        }
        case GameState.state.signals.GAME_OTHER_BALL: {
            const notifyContainer = notyfyContainer();
            notifyContainer.appendChild(gameOther2D());
            const parent = parentUI();
            parent.appendChild(notifyContainer);
            break;
        }
    }

    return new Promise((res, rej) => {
        setTimeout(() => {
            res(null);
            destroyNotify();
        }, timeout);
    });
}
//--------------------------------------------------------->

function youWin2D() {
    const win = document.createElement('div');
    win.classList.add("notify-win");
    if (GameState.state.lang === "ru") {
        win.innerHTML = `<p>Уровень Пройден!</p>`;
    } else if (GameState.state.lang === "ru") {
        win.innerHTML = `<p>You Win !</p>`;
    }
    
    return win;
}
function gameOther2D() {
    const res = document.createElement('div');
    res.classList.add("notify-game-other");
    if (GameState.state.lang === "ru") {
        res.innerHTML = `<p>Поражение</p>`;
    } else if (GameState.state.lang === "ru") {
        res.innerHTML = `<p>Game Other</p>`;
    }
    return res;
}
const notyfyContainer = () => {
    const notifyContainer = document.createElement('div');
    notifyContainer.classList.add("notyfy-container");
    return notifyContainer
}
const parentUI = () => document.querySelector(".html-ui");
const destroyNotify = () => {
    parentUI().removeChild(document.querySelector('.notyfy-container'));
}