export default class PlayControl extends HTMLElement {
    private root: ShadowRoot;
    private UI = {
        exitButton: null as HTMLElement,
    };
    private onExitEvent: () => void;

    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = renderTemplate();
        this.setAttribute("class", "play-control");
        this.UI.exitButton = this.root.querySelector(".exit-button");
    }
    connectedCallback() {
        this.UI.exitButton.addEventListener('click', () => {
            if (this.onExitEvent) {
                this.onExitEvent();
            }
        })
    }
    set exitEvent(fn: () => void) {
        this.onExitEvent = fn;
    }
    set show(isShow: boolean) {
        isShow ?
            this.style.visibility = 'visible' :
            this.style.visibility = 'hidden';
    }
}
if (!customElements.get("nice2jm-play-control")) {
    customElements.define("nice2jm-play-control", PlayControl);
}

function renderTemplate() {
    const html = `
        <button class="exit-button button"></button>
    `;
    const css = `
        <style>
            :host{  
                display:flex;
                width: 50px;
                min-height:80px;
                border: 1px solid rgba(100, 100, 100, 0.5);
                padding:1rem;
            }
            button{
                margin:5px;
                width:100%;
                height:30px;
                background:transparent;
                border:none;
                background-image:url("public/icons/logout.png");
                background-position: center center;
                background-size:30px 30px;
                background-repeat:no-repeat;
                cursor:pointer;
            }
        </style>
    `
    return `${html}${css}`;
}