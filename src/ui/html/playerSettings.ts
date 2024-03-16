import { STRINGS } from "@/game_state/strings/strings";

export default class PlayerSettings extends HTMLElement {
    private root: ShadowRoot;
    private ui = {
        soundButton: null as HTMLElement
    };
    private soundEvent: (state: boolean) => void;
    isSound = false;

    constructor() {
        super();
        this.root = this.attachShadow({ mode: "open" });
        this.root.innerHTML = renderTemplate();
        this.setAttribute("class", "player-settings");
        this.ui.soundButton = this.root.querySelector(".sound-on");
        this.ui.soundButton.style.backgroundImage = "url(public/icons/sound-off.png)";
    }
    connectedCallback() {
        this.ui.soundButton.addEventListener("click", () => {
            if (this.isSound) {
                this.isSound = false;
                this.ui.soundButton.style.backgroundImage = "url(public/icons/sound-off.png)";
            } else {
                this.isSound = true;
                this.ui.soundButton.style.backgroundImage = "url(public/icons/volume.png)";
            }
            this.soundEvent(this.isSound);
            this.remove();
        });
    }
    setSoundEvent(fn: (state: boolean) => void) {
        this.soundEvent = fn;
    }
}
if (!customElements.get("nice2jm-player-settings")) {
    customElements.define("nice2jm-player-settings", PlayerSettings);
}
function renderTemplate() {
    const header = STRINGS.playerSettingsMenu.header.ru;
    const html = `
        <div class="menu">
            <h1>${header}</h1>
            <button class="sound-on"></button>
        </div>
    `;
    const css = `
        <style>
            :host{
                width: 100vw;
                height: 100vh;
                border-radius: 1rem;
                background: rgba(50,50,50,0.8);
                position:absolute;
                display:flex;
                justify-content:center;
                align-items:center;
                top:0;
                left:0;
            }
            .menu{
                display:flex;
                flex-direction:column;
                justify-content:start;
                align-items:center;
                width: 250px;
                height: 180px;
                border-radius: 1rem;
                box-shadow: 0 0 5px 3px rgba(0,0,0,0.8);
                background: rgba(250,250,250,0.8);
                font: 200 1rem Arial;
                color: rgb(100,100,100);
            }
            .h1{
                display: block;
                height: 1.1rem;
            }
            .sound-on{
                width:50px;
                height:50px;
                border: none;
                border-radius:50%;
                box-shadow:0 0 3px 2px rgba(100,100,100,0.3);
                background-image: url("public/icons/sound-off.png");
                background-position:center center;
                background-repeat:no-repeat;
                background-size:40px 40px;
            }
            .sound-on:hover{
                transform:scale(1.1);
                box-shadow:0 0 5px 3px rgba(100,100,120,0.5);
            }
        </style>
    `;
    return `${html}${css}`;
}