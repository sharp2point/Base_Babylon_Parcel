export default class Scoreboard extends HTMLElement {
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
            this.shadowRoot.innerHTML = htmlRender();
            this.setAttribute("class", "scoreboard");
            this._timer = this.shadowRoot.querySelector(".scoreboard-time span");
            this._score = this.shadowRoot.querySelector(".scoreboard-score span");
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

customElements.define("nice2jm-scoreboard", Scoreboard);

function htmlRender() {
    const html = `
        <p class="scoreboard-score scoreboard-view"><img src="./public/icons/score.png"><span>0000</span></p>
        <p class="scoreboard-time scoreboard-view"><img src="./public/icons/timer.png"><span>0000</span></p>
    `
    const style = `
            <style>
                :host{
                    width: 250px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: start;
                    border: 1px solid rgba(100, 100, 100, 0.5);
                    background: rgba(0, 0, 0, 0);
                }
                .scoreboard-view {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: start;
                    gap:0.25rem;
                    width: 50%;
                }

                .scoreboard-view img {
                    width: 30px;
                    height: 30px;
                }

                .scoreboard-view span {
                    font: bold 2.5rem "Impact";
                }

                .scoreboard-score {
                    color: rgb(130, 100, 50);
                    padding: 5px;
                }

                .scoreboard-time {
                    color: rgb(130, 100, 50);
                    padding: 5px;
                }
            </style>    
    `
    return `${html}${style}`;
}