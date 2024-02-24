import { GameState } from "@/game_state/game_state";
import { UISTATE } from "@/game_state/ui/state";
import { teachAnimateSteps } from "@/teach/teach";
import Upmenu from "./upmenu";

export function removePreloader() {
    const preloader: HTMLElement = document.querySelector(".preload-container");
    preloader.parentNode.removeChild(preloader);

    return new Promise((resolve) => {
        setTimeout(() => {
            showMenuUI(true);
            resolve(null);
        }, 500)
    })
}

function uiHtmlComponents() {
    const uiPlace = document.querySelector("#ui-place") as HTMLElement;
    const upMenu = document.querySelector(".up-menu") as Upmenu;
    UISTATE.UI.set("uiPlace", uiPlace);
    UISTATE.UI.set("header", document.querySelector(".header"));
    UISTATE.UI.set("footer", document.querySelector(".footer"));
    UISTATE.UI.set("progress", document.querySelector(".progress"));
    UISTATE.UI.set("scoreboard", document.querySelector(".scoreboard"));
    UISTATE.UI.set("upmenu", upMenu);

    preloader(uiPlace);
    appendEventListenerUpMenu(upMenu);
}
// PRELOADER ----------------------------------------
function preloader(parent: HTMLElement) {
    const container = document.createElement("div");
    container.classList.add("preload-container");

    const ring_1 = document.createElement("div");
    ring_1.classList.add("ring");
    const ring_2 = document.createElement("div");
    ring_2.classList.add("ring");
    const ring_3 = document.createElement("div");
    ring_3.classList.add("ring");

    container.appendChild(ring_1);
    container.appendChild(ring_2);
    container.appendChild(ring_3);

    parent.appendChild(container);
}

export function showUILayout(isShow: boolean) {
    const layout = UISTATE.UI.get("uiPlace");
    isShow ?
        layout.classList.remove("hide") :
        layout.classList.add("hide");
}
function showMenuUI(isShow: boolean) {
    const upmenu = UISTATE.UI.get("header");
    const footer = UISTATE.UI.get("footer");
    if (isShow) {
        upmenu.classList.remove("hide");
        footer.classList.remove("hide");
    } else {
        upmenu.classList.add("hide");
        footer.classList.add("hide");
    }
}
function appendEventListenerUpMenu(menu: Upmenu) {
    menu.fullscreenButton.addEventListener("click", () => {
        onFullscreenClickEvent(menu.fullscreenButton);
    });
    menu.teachButton.addEventListener("click", () => {
        onTeachClickEvent();
    })
    menu.languageButton.addEventListener("click", () => {
        onLanguageClickEvent(menu.languageButton);
    });
}
function onFullscreenClickEvent(image: HTMLImageElement) {
    if (document.fullscreenEnabled) {
        if (!GameState.state.isFullScreen) {
            GameState.state.isFullScreen = true;
            image.src = "public/icons/fullscreen_exit.png";
            if (document.body.requestFullscreen) {
                document.body.requestFullscreen();
            }
        } else {
            GameState.state.isFullScreen = false;
            image.src = "public/icons/fullscreen.png";
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
}
function onTeachClickEvent() {
    teachAnimateSteps(UISTATE.PIXI);
}
function onLanguageClickEvent(image: HTMLImageElement) {
    if (GameState.state.lang === "ru") {
        GameState.state.lang = "eng";
        image.src = "public/icons/english.png";
    } else {
        GameState.state.lang = "ru";
        image.src = "public/icons/russian.png";
    }
}
uiHtmlComponents();

