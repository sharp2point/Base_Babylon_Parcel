import Symbiote, { html, css } from "@symbiotejs/symbiote";

export class InitScreen extends Symbiote {
    init$ = {
        title: '',
    }
}
InitScreen.bindAttributes({
    'attr-title': 'title'
});

InitScreen.template = html` 
    <canvas class="init-screen-canvas"></canvas>
    <h2>{{title}}</h2>
    <pre-loader></pre-loader>
    <play-button class="hide"></play-button>
`;

InitScreen.rootStyles = css`
    init-screen{
        color: rgba(200,100,100,0.5);
        position: absolute;
        top:0;
        left:0;
        background: rgb(5, 4, 29);
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap:5rem;
        pointer-events: none;
    }
    .init-screen-canvas{
        position: absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
    }
    pre-loader{
        
    }
    play-button{
        pointer-events: auto;
        cursor: pointer;        
    }
`;

InitScreen.reg('init-screen');
