import Symbiote, { css, html } from "@symbiotejs/symbiote";

export class PlayButton extends Symbiote {
    init$ = {
        onMouseMove: (e) => {
            let x = e.pageX - this.offsetLeft;
            let y = e.pageY - this.offsetTop;
            this.style.setProperty('--x', x + 'px');
            this.style.setProperty('--y', y + 'px');
        }
    }
}
PlayButton.template = html`
    <a ${{ onmousemove: 'onMouseMove' }}><span>Play</span></a>
`;
PlayButton.rootStyles = css`    
    play-button{
        --clr:#f75; 
        border-radius: 50%;
        border: 8px solid rgba(45,45,45,0.6);
        box-shadow: 0 0 3px 10px rgba(200,200,210,0.5) ;
    }
    a{
        display:flex;
        justify-content:center;
        align-items:center;   
        position:relative;
        width:150px;
        height:150px;
        padding:20px;
        color:#BBB;
        /*background-image: radial-gradient(rgba(45,45,45,1), rgba(45,30,65,1));*/
        border-radius: 50%;
        font-size:2.2rem;
        text-transform: uppercase;
        transition: 0.5s;        
        overflow:hidden;
    }
    a:hover{
        color: var(--clr);
        text-shadow:0 0 20px var(--clr),
                    0 0 40px var(--clr);
    }
    a span{
        position: relative;
        z-index:1;
        letter-spacing:0.2rem;       
    }
    a::before{
        content:'';
        position:absolute;
        top:var(--y);
        left:var(--x);
        transform: translate(-50%,-50%);
        background: radial-gradient(var(--clr), transparent,transparent);
        width:200px;
        height:200px;
        opacity: 0;
        transition: 0.5s, top 0s, left 0s;
        border:1px solid green;
    }
    a:hover::before{
        opacity:1;
    }
    a::after{
        content:'';
        position:absolute;
        inset:2px;
        background-image: radial-gradient(rgba(100,100,100,1) 0%,rgba(100,100,100,1) 55%, rgba(145,145,145,1) 57%, rgba(145,145,145,1) 60%,rgba(100,100,100,0.3) 100%);
        border-radius: 50%;
    }
`;
PlayButton.reg("play-button");