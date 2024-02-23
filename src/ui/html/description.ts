export default class Description extends HTMLElement {
    _root = null;
    _header = "Глава первая";
    _descript = "Путь в тысячу вёрст начинается с первого шага.";
    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this._root.innerHTML = renderHTML(this._header, this._descript);
        this.setAttribute("class", "content");
    }
}
customElements.define("nice2jm-descript", Description);

function renderHTML(header: string, descript: string) {
    const html = `
        <h2>${header}</h2>
        <p>${descript}</p>
    `;
    const style = `
        <style>
            :host{
                display: flex;
                flex-direction: column;
                justify-content: end;
                align-items: center;
                gap:0rem;
                width: 100%;
                max-width: 250px;
                height:250px;
            }
            h2 {
                font: 2rem "Arial";
                letter-spacing: 0.1rem;
                color: rgb(130, 100, 50)
            }
            p {
                font: 1.1rem "Arial";
                font-style: italic;
                text-align: center;
                color: rgb(200, 200, 200)
            }
        </style>
    `;
    const media = `
        <style>
            @media screen and (max-height: 760px) {
                :host {
                    height: 220px;
                }
            }
            @media screen and (max-height: 680px) {
                :host {
                    height: 190px;
                }
            }
            @media screen and (max-height: 605px) {
                :host {
                    height: 160px;
                }
            }
            @media screen and (max-height: 550px) {
                :host {
                    height: 150px;
                }
            }
            @media screen and (max-height: 500px) {
                :host {
                    height: 110px;
                }
                h2{
                    font-size: 1.9rem;
                    line-height:1.1rem;
                    margin-bottom:-0.05rem;
                }
                p{
                    font-size: 1rem;
                }
            }
            @media screen and (max-height: 400px) {
                :host {
                    height: 90px;
                }
            }
            @media screen and (max-height: 350px) {
                :host {
                    height: 70px;
                }
                h2{
                    font-size: 1.5rem;
                }
                p{
                    font-size: 0.9rem;
                }
            }
            @media screen and (max-height: 320px) {
                :host {
                    height: 50px;
                }
                h2{
                    font-size: 1.8rem;
                }
                p{
                    visibility: hidden;
                    display: none;
                }
            }
            @media screen and (max-height: 255px) {
                :host {
                    visibility: hidden;
                    display: none;
                }
            }
        </style>
    `;
    return `${html}${style}${media}`;
}