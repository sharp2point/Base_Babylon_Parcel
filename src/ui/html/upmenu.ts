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
                min-height:50px;
                border-radius:0.5rem;
                padding:1rem;
                border:1px solid rgb(100,100,100);
                background: rgba(50,40,60,0.5);
            }
            img{
                width: 40px;
                height: 40px;
                margin:5px;
                pointer-events: all;
                cursor: pointer;
                
            }
            img:hover{
                animation: hoveranimate 300ms;
                transform: scale(1.15);
            }
            @keyframes hoveranimate{
                0%{
                    transform: scale(0.8);
                },
                100%{
                    transform: scale(1.2);
                }
            }
        </style>
    `;
    return `${html}${style}`;
}