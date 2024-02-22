import { GameState } from "@/game_state/game_state";
import { LEVELSDESCRIPT } from "@/game_state/levels_descript";
import { UISTATE } from "@/game_state/ui/state";
import { teachAnimateSteps } from "@/teach/teach";

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
    UISTATE.UI.set("uiPlace", uiPlace);
    UISTATE.UI.set("upMenu", document.querySelector(".up-menu"));
    UISTATE.UI.set("footer", document.querySelector(".footer"));

    preloader(uiPlace);
    appendEventListenerUpMenu();
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

// UP MENU ------------------------------------------

function showMenuUI(isShow: boolean) {
    const upmenu = UISTATE.UI.get("upMenu");
    const footer = UISTATE.UI.get("footer");
    if (isShow) {
        upmenu.classList.remove("hide");
        footer.classList.remove("hide");
    } else {
        upmenu.classList.add("hide");
        footer.classList.add("hide");
    }
}
function appendEventListenerUpMenu() {
    const upmenu = UISTATE.UI.get("upMenu");
    upmenu.addEventListener('click', (e) => {
        const target = e.target;
        if (target instanceof HTMLImageElement) {
            switch (target.dataset["button"]) {
                case "fullscreen": {
                    onFullscreenClickEvent(target);
                    break;
                }
                case "teach": {
                    onTeachClickEvent(target);
                    break;
                }
                case "lang": {
                    onLanguageClickEvent(target)
                    break;
                }
                default: {
                    throw new Error("Up Menu Error");
                }
            }
        }

    })
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
function onTeachClickEvent(image: HTMLImageElement) {
    teachAnimateSteps(UISTATE.PIXI);
}
function onLanguageClickEvent(image: HTMLImageElement) {
    if (GameState.state.lang === "ru") {
        GameState.state.lang = "eng";
        image.src = "public/icons/english.png";
        changeLocal("eng")
    } else {
        GameState.state.lang = "ru";
        image.src = "public/icons/russian.png";
        changeLocal("ru")
    }
}
//--OLD------------------------------------






function textBlock(parent: HTMLElement) {
    const ui = document.createElement("div");
    ui.classList.add("ui-text-block");
    ui.innerHTML = `<span class='text'>инди-проект <span class='text-name text'> COLOBORUS </span> </span>                    
                    <span class='text-year text'>2024 г.</span>`;
    parent.appendChild(ui);
}

function scoreBoard(parent: HTMLElement) {
    const ui = document.createElement("div");
    ui.classList.add("scoreboard");
    ui.classList.add("hide");
    parent.appendChild(ui);

    const points = containerUI(ui);
    const timer = containerUI(ui);

    iconUI(points, "public/icons/score.png");
    iconUI(timer, "public/icons/timer.png");
    UISTATE.Scoreboard.score = numberUI(points, 'score-ui');
    UISTATE.Scoreboard.timer = numberUI(timer, 'timer-ui');
}
function containerUI(parent: HTMLElement) {
    const ui = document.createElement("div");
    ui.classList.add("container-ui");
    parent.appendChild(ui);
    return ui;
}
function iconUI(parent: HTMLElement, pathToIcon: string) {
    const ui = document.createElement("div");
    ui.classList.add("icon-ui");
    parent.appendChild(ui);
    const icon = new Image();
    icon.src = pathToIcon;
    icon.onload = () => {
        icon.classList.add("icon")
        ui.appendChild(icon);
    }
    return ui;
}
function numberUI(parent: HTMLElement, class_name: string) {
    const ui = document.createElement("span");
    ui.classList.add(class_name);
    ui.innerText = "0000";
    parent.appendChild(ui);
    return ui;
}
function spinMenuButtons(parent: HTMLElement) {
    const buttonPlace = document.createElement("div");
    buttonPlace.classList.add("menu-buttons-place");

    const leftButton = document.createElement("button");
    leftButton.classList.add("left-menu-button");
    leftButton.classList.add("menu-button");
    leftButton.innerText = GameState.state.lang === "ru" ? "ВПЕРЁД" : "PREV";

    const rightButton = document.createElement("button");
    rightButton.classList.add("right-menu-button");
    rightButton.classList.add("menu-button");
    rightButton.innerText = GameState.state.lang === "ru" ? "НАЗАД" : "NEXT";

    buttonPlace.appendChild(leftButton);
    buttonPlace.appendChild(rightButton);
    parent.appendChild(buttonPlace);
}
export function showSpinMenuButtons(isShow: boolean) {
    const leftButton = document.querySelector(".left-menu-button");
    const rightButton = document.querySelector(".right-menu-button");
    if (isShow) {
        leftButton.classList.remove("hide");
        rightButton.classList.remove("hide");
    } else {
        leftButton.classList.add("hide");
        rightButton.classList.add("hide");
    }

}
function downBlock(parent: HTMLElement) {
    const block = document.createElement("div");
    block.classList.add("down-block");
    parent.appendChild(block);
    return block
}
function levelDescription(parent: HTMLElement) {
    const place = document.createElement("div");
    place.classList.add("level-description");
    place.innerHTML = `
        <h2 class="level-desc-part">Part</h1>
        <h1 class="level-desc-header">Header</h1>
        <p class="level-desc-description">Description</p>
    `;
    parent.appendChild(place);
    return place;
}
function resultBlock(parent: HTMLElement) {
    const place = document.createElement('div');
    place.classList.add('result-place');
    place.innerHTML = `
        <h3 class="result-place-header">лучший результат:</h3>
        <div class="result-place-result">
            <img class="result-win" src="public/icons/close.png"></img>
            <div class="result-score">0000</div>
        </div>
    `;
    parent.appendChild(place);
    return place;
}
export function redrawResult(isWin: boolean, score: number) {
    const win: HTMLImageElement = document.querySelector(".result-win");
    const resultScore = document.querySelector(".result-score");
    isWin ?
        win.src = "public/icons/crown.png" :
        win.src = "public/icons/close.png";
    resultScore.textContent = `${score}`.padStart(4, '0');
}
export function showResult(isShow: boolean) {
    const element = document.querySelector(".result-place");
    isShow ? element.classList.remove("hide") : element.classList.add("hide");
}
export function redrawLevelDescription(part: number, level: number, lang: string) {
    let description = null;
    switch (lang) {
        case "ru": {
            description = LEVELSDESCRIPT.parts[part].ru;
            break;
        }
        case "eng": {
            description = LEVELSDESCRIPT.parts[part].eng;
            break;
        }
        default: {
            throw new Error("Language Error");
            break;
        }
    }
    const parthead = document.querySelector(".level-desc-part");
    const header = document.querySelector(".level-desc-header");
    const desc = document.querySelector(".level-desc-description");
    parthead.textContent = description.description;
    header.textContent = description[level].header;
    desc.textContent = description[level].description;
}
export function showDescription(isShow: boolean) {
    const element = document.querySelector(".level-description");
    isShow ? element.classList.remove("hide") : element.classList.add("hide");
}
function settingsUIBlock(parent: HTMLElement) {
    const place = document.createElement('div');
    place.classList.add("settings-block");
    const lang = GameState.state.lang === "ru" ? "public/icons/russian.png" : "public/icons/english.png"
    place.innerHTML = `
        <input type="image" class="fullscreen-button settings-button" alt="Full Screen" src="public/icons/fullscreen.png" />
        <input type="image" class="teach-button settings-button" alt="Teach" src="public/icons/education.png" />        
        <input type="image" class="lang-button settings-button" alt="Language" src=${lang} />
    `;

    parent.appendChild(place);
}
export function showSettingsUI(isShow: boolean) {
    const element = document.querySelector(".settings-block");
    isShow ? element.classList.remove("hide") : element.classList.add("hide");
}

function changeLocal(local: string) {
    const indie = document.querySelector(".ui-text-block");
    const leftButton = document.querySelector(".left-menu-button") as HTMLElement;
    const rightButton = document.querySelector(".right-menu-button") as HTMLElement;
    const result = document.querySelector('.result-place');

    switch (local) {
        case "ru": {
            indie.innerHTML = `<span class='text'>инди-проект <span class='text-name text'> SOLOBORUS </span> </span>                    
                    <span class='text-year text'>2024 г.</span>`;
            leftButton.innerText = "ВПЕРЕД";
            rightButton.innerText = "НАЗАД";
            result.innerHTML = `
                <h3 class="result-place-header">лучший результат:</h3>
                <div class="result-place-result">
                    <img class="result-win" src="public/icons/close.png"></img>
                    <div class="result-score">0000</div>
                </div>
            `;
            redrawLevelDescription(1, GameState.state.level, "ru")
            break;
        }
        case "eng": {
            indie.innerHTML = `<span class='text'>indie-project <span class='text-name text'> SOLOBORUS </span> </span>                    
                    <span class='text-year text'>2024 y.</span>`;
            leftButton.innerText = "PREV";
            rightButton.innerText = "NEXT";
            result.innerHTML = `
                <h3 class="result-place-header">best results:</h3>
                <div class="result-place-result">
                    <img class="result-win" src="public/icons/close.png"></img>
                    <div class="result-score">0000</div>
                </div>
            `;
            redrawLevelDescription(1, GameState.state.level, "eng")
            break;
        }
    }
}
//----------------------------------------------->
uiHtmlComponents();

