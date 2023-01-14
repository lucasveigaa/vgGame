const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
    battleZonesMap.push(battleZonesData.slice(i, 70 + i))
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

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            battleZones.push(
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

//creating player images
const playerDownImage = new Image()
playerDownImage.src = './imgs/playerDown.png'
const playerUpImage = new Image()
playerUpImage.src = './imgs/playerUp.png'
const playerLeftImage = new Image()
playerLeftImage.src = './imgs/playerLeft.png'
const playerRightImage = new Image()
playerRightImage.src = './imgs/playerRight.png'

const player = new Sprite({
    // 192 e 68 é o tamanho da imagem do player
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2,
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10,
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        down: playerDownImage,
        right: playerRightImage,
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

const movables = [background, ...boundaries, ...battleZones, foregroundObjects]

function rectangularCollision({ player, obstacle }) {
    return (
        player.position.x + player.width >= obstacle.position.x &&
        player.position.x <= obstacle.position.x + obstacle.width &&
        player.position.y <= obstacle.position.y + obstacle.height &&
        player.position.y + obstacle.height >= obstacle.position.y
    )
}

const battle = {
    initiated: false,
}

//loading map and player
function animate() {
    const animationId = window.requestAnimationFrame(animate)

    //Drawing map
    background.draw()
    //Drawing boundaries on map
    boundaries.forEach((boundary) => {
        boundary.draw()
    })
    battleZones.forEach((battleZone) => {
        battleZone.draw()
    })

    player.draw()
    foregroundObjects.draw()

    let moving = true
    player.animate = false

    if (battle.initiated) return
    // Activate a battle
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            const overlappingArea =
                Math.min(
                    (player.position.x + player.width,
                    battleZone.position.x + battleZone.width) -
                        Math.max(player.position.x, battleZone.position.x)
                ) *
                (Math.min(
                    player.position.y + player.height,
                    battleZone.position.y + battleZone.height
                ) -
                    Math.max(player.position.y, battleZone.position.y))
            if (
                rectangularCollision({
                    player,
                    obstacle: battleZone,
                }) &&
                overlappingArea > (player.width * player.height) / 2 &&
                Math.random() < 0.01
            ) {
                //deactivate current animation loop
                window.cancelAnimationFrame(animationId)

                battle.initiated = true
                //Animate flash css like opacity from 0 to 1
                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    repeat: 3,
                    //smoothing animation
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                //activate a new animation loop
                                animateBattle()
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4,
                                })
                            },
                        })
                    },
                })
                break
            }
        }
    }

    if (keys.w.pressed && lastKey === 'w') {
        player.animate = true
        player.image = player.sprites.up

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
        player.animate = true
        player.image = player.sprites.left

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
        player.animate = true
        player.image = player.sprites.down

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
        player.animate = true
        player.image = player.sprites.right

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
// animate()

const battleBackgroundImage = new Image()
battleBackgroundImage.src = './imgs/battleBackground.png'
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    image: battleBackgroundImage,
})

const draggleImage = new Image()
draggleImage.src = './imgs/draggleSprite.png'

const draggle = new Sprite({
    position: {
        x: 800,
        y: 100,
    },
    image: draggleImage,
    frames: {
        max: 4,
        hold: 30,
    },
    animate: true,
    isEnemy: true,
})

const embyImage = new Image()
embyImage.src = './imgs/embySprite.png'

const emby = new Sprite({
    position: {
        x: 280,
        y: 325,
    },
    image: embyImage,
    frames: {
        max: 4,
        hold: 30,
    },
    animate: true,
})

function animateBattle() {
    window.requestAnimationFrame(animateBattle)
    battleBackground.draw()
    draggle.draw()
    emby.draw()
}
animateBattle()
// animate()

document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
        emby.attack({
            attack: {
                name: 'Tackle',
                damage: 10,
                type: 'Normal',
            },
            recipient: draggle,
        })
    })
})

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
