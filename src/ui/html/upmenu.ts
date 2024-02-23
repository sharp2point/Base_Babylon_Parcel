export default class Upmenu extends HTMLElement {
    _root = null;
    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this._root.innerHTML = renderHTML();
        this.setAttribute("class", "up-menu");
    }
}
customElements.define("nice2jm-upmenu", Upmenu);

function renderHTML() {
    const html = `
        <img data-button="fullscreen" src="./public/icons/fullscreen.png">
        <img data-button="teach" src="./public/icons/education.png">
        <img data-button="lang" src="./public/icons/russian.png">
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