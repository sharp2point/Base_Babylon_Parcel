export function initGameTimeout() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });
}
export function loadAssets(state: any) {
    const img = new Image(256, 256);
    img.src = "public/sprites/points10.webp";
    img.onload = () => {
        state.set("points10", img);
    }
}
export function getScreenAspect() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return width / height;
}