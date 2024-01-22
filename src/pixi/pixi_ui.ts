import { AGAME } from '@/game_state/game_state';
import * as PIXI from 'pixi.js';

export function initPIXI() {
    const pixiPlace = document.createElement('div');
    pixiPlace.classList.add("score-board")
    pixiPlace.style.width = "90vw";
    pixiPlace.style.height = "100px";    
    document.body.appendChild(pixiPlace);
    const app = new PIXI.Application({ backgroundAlpha: 0, resizeTo: pixiPlace });
    pixiPlace.appendChild(app.view as HTMLCanvasElement);
    AGAME.PIXI = app;
}

export function drawScoreBoard(text: string) {

    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
        lineJoin: 'round',
    });
    const basicText = new PIXI.Text(text,style);
    basicText.x = 50;
    basicText.y = 50;

    (AGAME.PIXI as PIXI.Application<PIXI.ICanvas>).stage.removeChildren();
    AGAME.PIXI.stage.addChild(basicText);
}