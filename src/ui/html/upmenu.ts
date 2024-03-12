export default class Upmenu extends HTMLElement {
    private root = null;
    private fullscreen_button = null;
    private teach_button = null;
    private lang_button = null;
    private sound_button = null;

    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.root.innerHTML = renderHTML();
        this.setAttribute("class", "up-menu");
        this.fullscreen_button = this.root.querySelector(".fullscreen-button");
        this.teach_button = this.root.querySelector(".teach-button");
        this.lang_button = this.root.querySelector(".language-button");
        this.sound_button = this.root.querySelector(".sound-button");
    }
    get fullscreenButton() {
        return this.fullscreen_button;
    }
    get teachButton() {
        return this.teach_button;
    }
    get languageButton() {
        return this.lang_button;
    }
    get soundButton() {
        return this.sound_button;
    }
}
customElements.define("nice2jm-upmenu", Upmenu);

function renderHTML() {
    const html = `
        <img class="fullscreen-button" data-button="fullscreen" src="./public/icons/fullscreen.png">
        <img class="teach-button" data-button="teach" src="./public/icons/education.png">
        <img class="language-button" data-button="lang" src="./public/icons/russian.png">
        <img class="sound-button" data-button="teach" src="./public/icons/sound.png">
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