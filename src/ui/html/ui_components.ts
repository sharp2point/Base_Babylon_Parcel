import { UISTATE } from "@/game_state/ui/state";

export function backSetOpaq_0() {
    const place: HTMLElement = document.querySelector(".html-ui");
    place.classList.add("html-back-opaq-0");
    const preloader: HTMLElement = document.querySelector(".preload-container");
    preloader.parentNode.removeChild(preloader);
}

function uiHtmlComponents() {
    const place: HTMLElement = document.querySelector("#ui-place");
    const ui = UI(place);
    scoreBoard(ui);
    const floor = downBlock(ui);
    spinMenuButtons(floor);
    showSpinMenuButtons(false)
    textBlock(floor);

    preloader(place);
}
function UI(parent: HTMLElement) {
    const ui = document.createElement("div");
    ui.classList.add("html-ui");
    parent.appendChild(ui);
    return ui;
}
function textBlock(parent: HTMLElement) {
    const ui = document.createElement("div");
    ui.classList.add("ui-text-block");
    ui.innerHTML = `<span class='text'>инди-проект <span class='text-name text'> COLOBORUS </span> </span>                    
                    <span class='text-year text'>2024 г.</span>`;
    parent.appendChild(ui);
}
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
    leftButton.innerText = "PREV";

    const rightButton = document.createElement("button");
    rightButton.classList.add("right-menu-button");
    rightButton.classList.add("menu-button");
    rightButton.innerText = "NEXT";

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
//----------------------------------------------->
uiHtmlComponents();

