export default class Progressboard extends HTMLElement {
    _root = null;
    _init = false;
    _timer = null;
    _score = null;

    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        if (!this._init) {
            this.shadowRoot.innerHTML = renderHTML();
            this.setAttribute("class", "progress");
            this._timer = this.shadowRoot.querySelector(".progress-time span");
            this._score = this.shadowRoot.querySelector(".progress-score span");
            this._init = true;
        }
    }
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {

    }
    set score(score: number) {
        this._score.innerHTML = `${score}`.padStart(4, "0");
    }
    set timer(time: number) {
        this._timer.innerHTML = `${time}`.padStart(4, "0");
    }
    set show(isShow: boolean) {
        isShow ?
            this.style.visibility = 'visible' :
            this.style.visibility = 'hidden';
    }
}

customElements.define("nice2jm-progressboard", Progressboard);

function renderHTML() {
    const html = `
        <p class="progress-score progress-view"><img src="./public/icons/score.png"><span>0000</span></p>
        <p class="progress-time progress-view"><img src="./public/icons/timer.png"><span>0000</span></p>
    `
    const style = `
            <style>
                :host{
                    display:flex;
                    flex-direction:column;
                    align-items: center;
                    justify-content:end;
                    height:250px;
                    width: 100%;
                }
                .progress-view {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    width: 80%;
                    margin-top:-0.7rem;
                    border-radius:0.5rem;
                    padding:0.5rem;
                    border:1px solid rgb(100,100,100);
                    background: rgba(50,40,60,0.5);
                }

                .progress-view img {
                    width: 40px;
                    height: 40px;
                }

                .progress-view span {
                    font: bold 3rem "Impact";
                    text-shadow: 2px 2px 2px rgb(100,60,10),3px 3px 10px rgb(10,10,10);
                }

                .progress-score {
                    color: rgb(150, 80, 50);
                }

                .progress-time {
                    color: rgb(120, 80, 30);
                }
            </style>    
    `
    const media = `
        <style>
            @media screen and (max-height: 860px ){
                :host{
                    height: 200px;
                }
            }
            @media screen and (max-height: 710px) {                
                :host {
                     height: 150px;
                }
                .progress-view{
                    width: 60%;
                }
                .progress-view img{
                    width: 35px;
                    height: 35px;
                }
                .progress-view span {
                    font: bold 2.5rem "Impact";
                }
            }
            @media screen and (max-height: 650px) {
                :host{
                     height: 130px;
                }
                .progress-view{
                    width: 50%;
                }
                .progress-view img{
                    width: 30px;
                    height: 30px;
                }
                .progress-view span {
                    font: bold 2.1rem "Impact";
                }
            }
            @media screen and (max-height: 610px) {
                :host{
                     height: 120px;
                }
                .progress-view{
                    width: 50%;
                }
                .progress-view img{
                    width: 25px;
                    height: 25px;
                }
                .progress-view span {
                    font: bold 1.8rem "Impact";
                }
            }
            @media screen and (max-height: 560px) {
                :host{
                    height: 100px;
                }
                .progress-view img{
                    width: 25px;
                    height: 25px;
                }
                .progress-view span {
                    font: bold 1.5rem "Impact";
                }
            }
            @media screen and (max-height: 500px) {
                :host {
                    height: 80px;
                    flex-direction: row;
                    gap:1rem;
                }
                .progress-view{
                    width: 40%;
                }
                .progress-view img{
                    width: 30px;
                    height: 30px;
                }
                .progress-view span {
                    font: bold 2rem "Impact";
                }
            }
            @media screen and (max-height: 400px) {
                :host {
                    height: 55px;
                    align-items: start;
                    justify-content:center;
                }
                .progress-view{
                    margin-top:0;
                }
            }
            @media screen and (max-height: 350px) {
                :host {
                     height: 40px;
                     width: 95%;
                }
                .progress-view img{
                    width: 20px;
                    height: 20px;
                }
                .progress-view span {
                    font: bold 1.25rem "Impact";
                }
            }
            @media screen and (max-height: 320px) {
                :host {
                    height: 35px;
                }
            }
            @media screen and (max-height: 255px) {
                :host {
                visibility: hidden;
                display: none;
                }
            }
        </style>
    `
    return `${html}${style}${media}`;
}