export const GameState = {
    isDragShield: false,
    isBallStart: false,
    dragBox: {
        up: 3,
        down: -7,
        left: -4.5,
        rigth: 4.5
    },
    gameObjects: {
        ball: null,
        shield: null,
        scene: null,
    },
    physicsMaterial: {
        ball: { mass: 10, restitution: 0.5, friction: 0.01 },
        shield: { mass: 100, restitution: 0.5, friction: 0.1 },
        ground: { mass: 1000, restitution: 0.0, friction: 0.0 },
        wall: { mass: 1000, restitution: 0.5, friction: 0.0 },        
    }
}