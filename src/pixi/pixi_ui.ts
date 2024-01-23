import { AGAME, GameState } from '@/game_state/game_state';
import * as PIXI from 'pixi.js';

export function initPIXI() {
    const pixiPlace = document.createElement('div');
    pixiPlace.classList.add("score-board")
    pixiPlace.style.width = `${GameState.UI().score_board.size.width}px`;
    pixiPlace.style.height = `${GameState.UI().score_board.size.height}px`;
    pixiPlace.style.left = `calc(50% - ${GameState.UI().score_board.size.width / 2}px)`;
    document.body.appendChild(pixiPlace);
    const app = new PIXI.Application({ backgroundAlpha: 0, resizeTo: pixiPlace });
    pixiPlace.appendChild(app.view as HTMLCanvasElement);
    AGAME.PIXI = {
        place: pixiPlace,
        app: app
    };
}

export function drawScoreBoard(text: string) {

    const style = new PIXI.TextStyle({
        fontFamily: 'Impact',
        fontSize: 36,
        fontStyle: 'normal',
        fontWeight: '100',
        fill: ['#ffffff', '#aaaaaa'], // gradient
        stroke: '#aaaaaa',
        strokeThickness: 1,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
        lineJoin: 'round',
    });
    const basicText = new PIXI.Text(text, style);
    basicText.x = 30;
    basicText.y = 30;

    (AGAME.PIXI.app as PIXI.Application<PIXI.ICanvas>).stage.removeChildren();
    AGAME.PIXI.app.stage.addChild(basicText);
}

export function hideScoreBoard() {
    (AGAME.PIXI.place as HTMLElement).classList.add("hide");
}
export function showScoreBoard() {
    (AGAME.PIXI.place as HTMLElement).classList.remove("hide");
}