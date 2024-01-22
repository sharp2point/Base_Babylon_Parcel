import Symbiote, { html, css } from "@symbiotejs/symbiote";


export class PreLoader extends Symbiote {
    init$ = {

    }
}

PreLoader.template = html`
    <div class="text">Load...</div>
    <div class="loader">        
        <span style="--i:1;"></span>
        <span style="--i:2;"></span>
        <span style="--i:3;"></span>
        <span style="--i:4;"></span>
        <span style="--i:5;"></span>
        <span style="--i:6;"></span>
        <span style="--i:7;"></span>
        <span style="--i:8;"></span>
        <span style="--i:9;"></span>
        <span style="--i:10;"></span>
        <span style="--i:11;"></span>
        <span style="--i:12;"></span>
        <span style="--i:13;"></span>
        <span style="--i:14;"></span>
        <span style="--i:15;"></span>
        <span style="--i:16;"></span>
        <span style="--i:17;"></span>
        <span style="--i:18;"></span>
        <span style="--i:19;"></span>
        <span style="--i:20;"></span>
    </div>
`;

PreLoader.rootStyles = css`
    pre-loader{
        display:flex;
        justify-content: center;
        align-items: center;
        animation: animatePreLoader 10s linear infinite;  
        min-height: 100px; 
    }
    @keyframes animatePreLoader{
        0%{
            filter: hue-rotate(0deg);
        }
        100%{
            filter: hue-rotate(360deg);
        }
    }
    .text{
        font-size:1.6rem;
        color: white;
        position: absolute;
        top:35%;
        left:25%;
        width:100%;
        height:100%;
        display:flex;
    }
    .loader{
        position: relative;
        width: 120px;
        height: 120px;
    }
    .loader span{
        position: absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        transform: rotate(calc(18deg * var(--i)));
    }
    .loader span::before{
        content:'';
        position:absolute;
        top:0;
        left:0;
        width:15px;
        height:15px;
        border-radius: 50%;
        background: #00ff0a;
        box-shadow: 0 0 10px #00ff0a,
                    0 0 20px #00ff0a,
                    0 0 40px #00ff0a;
        animation: animatePoint 2s linear infinite;
        animation-delay: calc(0.1s * var(--i));
    }
    @keyframes animatePoint{
        0%{
            transform: scale(1);
        }
        80%,100%{
            transform: scale(0);
        }
    }
`;

PreLoader.reg('pre-loader');