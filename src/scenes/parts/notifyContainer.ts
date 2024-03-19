import { GameState } from "@/game_state/game_state";
import { UISTATE } from "@/game_state/ui/state";
import NotifyContainer from "@/ui/html/notifyContainer";


export function gameNotify(state: number, options: {}, timeout: number) {
    const notifyContainer = UISTATE.UI.get("notifyContainer") as NotifyContainer;
    switch (state) {
        case GameState.state.signals.LEVEL_WIN: {
            notifyContainer.setNotify = youWin2D();
            break;
        }
        case GameState.state.signals.GAME_OTHER_BALL: {
            notifyContainer.setNotify = gameOther2D();
            break;
        }
    }
    notifyContainer.show = true;

    return new Promise((res) => {
        setTimeout(() => {
            notifyContainer.show = false;
            res(null);
        }, timeout);
    });
}
//--------------------------------------------------------->

function youWin2D() {
    const win = document.createElement('div');
    win.setAttribute("class", "notify-win");

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