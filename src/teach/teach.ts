import { UISTATE } from "@/game_state/ui/state";
import { SPINMENU, rotateToNextPosition, rotateToPrevPosition } from "@/ui/spin2";
import * as PIXI from "pixi.js";

export function initTeach(parent: HTMLElement) {
    const app = new PIXI.Application({ background: "#101010", backgroundAlpha: 0.5, resizeTo: window });
    parent.appendChild(app.view);
    showTeach(false);
    UISTATE.PIXI = app;
    return app;
}
function addHandSprite(app: PIXI.Application<PIXI.ICanvas>) {
    const hand = PIXI.Sprite.from("public/icons/hand.webp");
    hand.width = 60;
    hand.height = 60;
    app.stage.addChild(hand);
    hand.anchor.set(0.5);
    hand.x = app.screen.width / 2;
    hand.y = 0;

    return hand;
}
function addCloseSprite(app: PIXI.Application<PIXI.ICanvas>) {
    const close = PIXI.Sprite.from("public/icons/close.webp");
    close.width = 60;
    close.height = 60;
    app.stage.addChild(close);
    close.anchor.set(0.5);
    close.x = app.screen.width / 2;
    close.y = 100;
    //close.alpha = 1;
    close.eventMode = "static";
    close.cursor = "pointer";
    close
        .on('pointerup', () => showTeach(false))
        .on('pointerenter', () => {
            close.width += 10;
            close.height += 10;
        })
        .on('pointerleave', () => {
            close.width = 60;
            close.height = 60;
        });

    return close;
}
function addTapSprite(app: PIXI.Application<PIXI.ICanvas>) {
    const tap = PIXI.Sprite.from("public/icons/tap.webp");
    tap.width = 50;
    tap.height = 50;
    app.stage.addChild(tap);
    tap.anchor.set(0.5);
    tap.x = app.screen.width / 2;
    tap.y = app.screen.height / 2;
    tap.alpha = 0;
    return tap;
}
export function teachAnimateSteps(app: PIXI.Application<PIXI.ICanvas>) {
    showTeach(true);
    let step = 0;
    app.stage.removeChildren(0, app.stage.children.length);
    const close = addCloseSprite(app);
    const hand = addHandSprite(app);
    const tap = addTapSprite(app);

    app.ticker.start();

    function stepOne(delta: number) {
        switch (step) {
            case 0: {
                if (hand.y < app.screen.height / 2 - 50) {
                    hand.y += 10 * delta;
                } else {
                    step = 1;
                }
                break;
            }
            case 1: {
                if (hand.x > app.screen.width / 2 - 100) {
                    hand.x -= 6 * delta;
                } else {
                    app.ticker.stop();
                    step = 2;
                    setTimeout(() => {
                        rotateToPrevPosition(SPINMENU.nodeMenu, UISTATE.Scene);
                        setTimeout(() => {
                            app.ticker.start();
                        }, 500);
                    }, 50);
                }
                break;
            }
            case 2: {
                if (hand.x <= app.screen.width / 2) {
                    hand.x += 6 * delta;
                } else {
                    if (hand.x < app.screen.width / 2 + 100) {
                        hand.x += 6 * delta;
                    } else {
                        app.ticker.stop();
                        step = 3;
                        setTimeout(() => {
                            rotateToNextPosition(SPINMENU.nodeMenu, UISTATE.Scene);
                            setTimeout(() => {
                                app.ticker.start();
                            }, 500);
                        }, 50);
                    }
                }
                break;
            }
            case 3: {
                if (hand.x >= app.screen.width / 2) {
                    hand.x -= 8 * delta;
                    hand.y += 5;
                } else {
                    step = 4;
                }
                break;
            }
            case 4: {
                if (hand.width < 80) {
                    hand.width += 1 * delta;
                    hand.height += 1 * delta;
                } else {
                    tap.x = hand.x - 5;
                    tap.y = hand.y - 30;
                    tap.alpha = 1;
                    setTimeout(() => {
                        tap.alpha = 0;
                    }, 150)
                    hand.width = 60;
                    hand.height = 60;
                    step = 5;
                }
                break;
            }
            case 5: {
                if (hand.width < 80) {
                    hand.width += 1 * delta;
                    hand.height += 1 * delta;
                } else {
                    tap.x = hand.x - 5;
                    tap.y = hand.y - 30;
                    tap.alpha = 1;
                    setTimeout(() => {
                        tap.alpha = 0;
                    }, 150)
                    hand.width = 60;
                    hand.height = 60;
                    step = 6;
                }
                break;
            }
            case 6: {
                app.ticker.remove(stepOne);
                app.ticker.stop();
                setTimeout(() => showTeach(false), 600)
                break;
            }
        }
    }
    app.ticker.add(stepOne);
}
function showTeach(isShow: boolean) {
    const teachPlace = document.querySelector("#teach-place");
    isShow ?
        teachPlace.classList.remove("hide") :
        teachPlace.classList.add("hide");
}
