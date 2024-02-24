export default class Upmenu extends HTMLElement {
    _root = null;
    _fullscreen_button = null;
    _teach_button = null;
    _lang_button = null;
    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this._root.innerHTML = renderHTML();
        this.setAttribute("class", "up-menu");
        this._fullscreen_button = this._root.querySelector(".fullscreen-button");
        this._teach_button = this._root.querySelector(".teach-button");
        this._lang_button = this._root.querySelector(".language-button");
    }
    get fullscreenButton() {
        return this._fullscreen_button;
    }
    get teachButton() {
        return this._teach_button;
    }
    get languageButton() {
        return this._lang_button;
    }
}
customElements.define("nice2jm-upmenu", Upmenu);

function renderHTML() {
    const html = `
        <img class="fullscreen-button" data-button="fullscreen" src="./public/icons/fullscreen.png">
        <img class="teach-button" data-button="teach" src="./public/icons/education.png">
        <img class="language-button" data-button="lang" src="./public/icons/russian.png">
    `;
    const style = `
        <style>
            :host{
                display:flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                width:100%;
                max-width: 250px;
                height:40px;
            }
            img{
                width: 40px;
                height: 40px;
                margin:5px;
                pointer-events: all;
                cursor: pointer;
            }
        </style>
    `;
    return `${html}${style}`;
}