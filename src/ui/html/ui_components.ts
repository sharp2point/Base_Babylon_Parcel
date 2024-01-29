export function backSetOpaq_0() {
    const place: HTMLElement = document.querySelector(".html-ui");
    place.classList.add("html-back-opaq-0");
    const preloader: HTMLElement = document.querySelector(".preload-container");
    preloader.parentNode.removeChild(preloader);
}

function uiHtmlComponents() {
    const place: HTMLElement = document.querySelector("#ui-place");
    const htmlUI = document.createElement("div");
    htmlUI.classList.add("html-ui");
    const txtBlock = textBlock();

    htmlUI.appendChild(txtBlock);
    preloader(place);

    place.appendChild(htmlUI);
}
function textBlock() {
    const text = document.createElement("div");
    text.classList.add("ui-text-block");
    text.innerHTML = `<span class='text'>инди-проект </span>
                    <span class='text-name text'> COLOBORUS </span>
                    <span class='text-year text'>2024 г.</span>`;
    return text;
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

//----------------------------------------------->
uiHtmlComponents();