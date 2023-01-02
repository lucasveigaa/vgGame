const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i))
}

const boundaries = []
const offset = {
    x: -735,
    y: -610,
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y,
                    },
                })
            )
    })
})

//creating map
const mapImage = new Image()
mapImage.src = './imgs/vgTown.png'

//foregroundObjects
const foregroundImage = new Image()
foregroundImage.src = './imgs/foregroundObjects.png'

//creating player
const playerImage = new Image()
playerImage.src = './imgs/playerDown.png'

const player = new Sprite({
    // 192 e 68 é o tamanho da imagem do player
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2,
    },
    image: playerImage,
    frames: {
        max: 4,
    },
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y,
    },
    image: mapImage,
})

const foregroundObjects = new Sprite({
    position: {
        x: offset.x,
        y: offset.y,
    },
    image: foregroundImage,
})

const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    s: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
}

const movables = [background, ...boundaries, foregroundObjects]

function rectangularCollision({ player, obstacle }) {
    return (
        player.position.x + player.width >= obstacle.position.x &&
        player.position.x <= obstacle.position.x + obstacle.width &&
        player.position.y <= obstacle.position.y + obstacle.height &&
        player.position.y + obstacle.height >= obstacle.position.y
    )
}

//loading map and player
function animate() {
    window.requestAnimationFrame(animate)
    //Drawing map
    background.draw()
    //Drawing boundaries on map
    boundaries.forEach((boundary) => {
        boundary.draw()
    })
    player.draw()
    foregroundObjects.draw()

    let moving = true
    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    player,
                    obstacle: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 3,
                        },
                    },
                })
            ) {
                moving = false
                break
            }
        }
        if (moving)
            movables.forEach((movable) => {
                movable.position.y += 3
            })
    } else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    player,
                    obstacle: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + 3,
                            y: boundary.position.y,
                        },
                    },
                })
            ) {
                moving = false
                break
            }
        }
        if (moving)
            movables.forEach((movable) => {
                movable.position.x += 3
            })
    } else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    player,
                    obstacle: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 3,
                        },
                    },
                })
            ) {
                moving = false
                break
            }
        }
        if (moving)
            movables.forEach((movable) => {
                movable.position.y -= 3
            })
    } else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    player,
                    obstacle: {
                        ...boundary,
                        position: {
                            x: boundary.position.x - 3,
                            y: boundary.position.y,
                        },
                    },
                })
            ) {
                moving = false
                break
            }
        }
        if (moving)
            movables.forEach((movable) => {
                movable.position.x -= 3
            })
    }
}
animate()

let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})
