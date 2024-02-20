import { GameState } from "@/game_state/game_state";
import { UISTATE } from "@/game_state/ui/state";
import { teachAnimateSteps } from "@/teach/teach";
import * as PIXI from "pixi.js";

const PIXIUISTATE = {
    button: {
        width: 60,
        height: 60
    }
}

export function initPixiUI(parent: HTMLElement) {
    const app = new PIXI.Application({ background: "#101010", backgroundAlpha: 0.5, resizeTo: window });
    parent.appendChild(app.view);
    UISTATE.PixiUI = app;
    testSprite(app);
}
export function redrawPixiUI(app: PIXI.Application<PIXI.ICanvas>) {
    testSprite(app);
}
function testSprite(app: PIXI.Application<PIXI.ICanvas>) {
    const fullScreenButton = PIXI.Sprite.from("public/icons/fullscreen.png");
    fullScreenButton.width = PIXIUISTATE.button.width;
    fullScreenButton.height = PIXIUISTATE.button.height;
    fullScreenButton.anchor.set(0.5);
    fullScreenButton.x = app.screen.width / 2 - (PIXIUISTATE.button.width + 10);
    fullScreenButton.y = PIXIUISTATE.button.width / 2 + 20;

    const teachButton = PIXI.Sprite.from("public/icons/education.png");
    teachButton.width = PIXIUISTATE.button.width;
    teachButton.height = PIXIUISTATE.button.height;
    teachButton.anchor.set(0.5);
    teachButton.x = app.screen.width / 2;
    teachButton.y = PIXIUISTATE.button.width / 2 + 20;

    const langButton = PIXI.Sprite.from("public/icons/russian.png");
    langButton.width = PIXIUISTATE.button.width;
    langButton.height = PIXIUISTATE.button.height;
    langButton.anchor.set(0.5);
    langButton.x = app.screen.width / 2 + (PIXIUISTATE.button.width + 10);
    langButton.y = PIXIUISTATE.button.width / 2 + 20;

    app.stage.addChild(fullScreenButton);
    app.stage.addChild(teachButton);
    app.stage.addChild(langButton);

    langButton.eventMode = "static";
    teachButton.eventMode = "static";
    fullScreenButton.eventMode = "static";

    fullScreenButton.on('pointerdown', async () => {
        if (document.fullscreenEnabled) {
            if (!GameState.state.isFullScreen) {
                GameState.state.isFullScreen = true;
                if (document.body.requestFullscreen) {
                    document.body.requestFullscreen();
                    fullScreenButton.texture = await PIXI.Texture.fromURL("public/icons/fullscreen_exit.png");
                }
            } else {
                GameState.state.isFullScreen = false;
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    fullScreenButton.texture = await PIXI.Texture.fromURL("public/icons/fullscreen.png");
                }
            }
        }
    });
    teachButton.on('pointerdown', () => {
        teachAnimateSteps(UISTATE.PIXI);
    });
    langButton.on('pointerdown', async () => {
        if (GameState.state.lang === "ru") {
            GameState.state.lang = "eng";
            langButton.texture = await PIXI.Texture.fromURL("public/icons/english.png");
        } else {
            GameState.state.lang = "ru";
            langButton.texture = await PIXI.Texture.fromURL("public/icons/russian.png");
        }
    });
}