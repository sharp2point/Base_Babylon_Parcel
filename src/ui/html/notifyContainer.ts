export default class NotifyContainer extends HTMLElement {
    private root: ShadowRoot;
    private notifyPlace: HTMLElement;

    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = renderTemplate();
        this.setAttribute("class", "notify-container");
        this.notifyPlace = this.root.querySelector(".notify-place");
        this.style.visibility = "hidden";
    }
    set setNotify(message: HTMLElement) {
        this.notifyPlace.replaceChildren(message);
    }
    set show(isShow: boolean) {
        isShow ?
            this.style.visibility = "visible" :
            this.style.visibility = "hidden";
    }
}
if (!customElements.get("nice2jm-notify-container")) {
    customElements.define("nice2jm-notify-container", NotifyContainer);
}

function renderTemplate() {
    const html = `
        <div class="notify-place"></div>
    `;
    const css = `
        <style>
            :host{
                width:100vw;
                height:100vh;
                position:absolute;
                top:0;
                left:0;
                display:flex;
                align-items:center;
                justify-content:center;
                background: rgba(100,100,100,0.9);
            }
            .notify-place{
                display:flex;
                align-items:center;
                justify-content:center;
                width:300px;
                height:300px;
                background:rgba(150,150,150,0.0);
                border: 0px solid rgba(50,50,50,0.5);
            }
            .notify-win{
                width:100wv;
                height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                background-position: center center;
                background-repeat: no-repeat;
            }
        </style>
    `;
    return `${html}${css}`;
}