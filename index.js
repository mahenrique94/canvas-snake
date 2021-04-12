const settings = {
  player: {
    initialPosition: {
      x: 10,
      y: 10,
    },
  },
  game: {
    pixelSize: 25,
    pixelCount: 20,
    foodCount: 3,
  },
  square: {
    colors: {
      empty: '#dcdcdc',
      player: '#00cc99',
      food: '#0099ff',
    },
  },
}

const player = {
  position: {
    x: settings.player.initialPosition.x,
    y: settings.player.initialPosition.y,
  },
  tails: [],
  moveTails() {
    if (this.tails.length) {
      this.tails.pop()
      this.tails.unshift([this.position.x, this.position.y])
    }
  }
}

const game = {
  pixel: settings.game.pixelSize,
  size: settings.game.pixelCount,
  foodCount: settings.game.foodCount,
  foods: new Map(),
  lastMovement: '',
  lastLoop: 0,
  lastTimeout: 0,
  context: null,
  randomPosition() {
    return Math.floor(Math.random() * this.size)
  },
  cleanScene(ctx) {
    ctx.clearRect(0, 0, this.pixel * this.size, this.pixel * this.size)
  },
  drawSquare(ctx, x, y) {
    ctx.fillStyle = settings.square.colors.empty
    ctx.fillRect(x * this.pixel, y * this.pixel, this.pixel - 1, this.pixel - 1)
  },
  drawPlayer(ctx, x, y, tail) {
    ctx.fillStyle = settings.square.colors.player
    ctx.fillRect(x * this.pixel, y * this.pixel, this.pixel - 1, this.pixel - 1)

    if (tail) return

    player.tails.forEach(([tailX, tailY]) => {
      this.drawPlayer(ctx, tailX, tailY, true)
    })
  },
  drawFood(ctx) {
    for (let i = 0; i < this.foodCount; i++) {
      const x = this.randomPosition()
      const y = this.randomPosition()
      ctx.fillStyle = settings.square.colors.food
      ctx.fillRect(x * this.pixel, y * this.pixel, this.pixel - 1, this.pixel - 1)
      this.foods.set(`${x}-${y}`, true)
    }
  },
  addFood(ctx) {
    const x = this.randomPosition()
    const y = this.randomPosition()
    ctx.fillStyle = settings.square.colors.food
    ctx.fillRect(x * this.pixel, y * this.pixel, this.pixel - 1, this.pixel - 1)
    this.foods.set(`${x}-${y}`, true)
  }
}

const movements = {
  ArrowUp() {
    const firstTail = player.tails[0]
    if (player.position.y === 0) return
    if (Array.isArray(firstTail) && (player.position.x === firstTail[0] && player.position.y - 1 === firstTail[1])) return

    player.moveTails()
    player.position.y -= 1
  },
  ArrowDown() {
    const firstTail = player.tails[0]
    if (player.position.y === 19) return
    if (Array.isArray(firstTail) && (player.position.x === firstTail[0] && player.position.y + 1 === firstTail[1])) return

    player.moveTails()
    player.position.y += 1
  },
  ArrowLeft() {
    const firstTail = player.tails[0]
    if (player.position.x === 0) return
    if (Array.isArray(firstTail) && (player.position.x - 1 === firstTail[0] && player.position.y === firstTail[1])) return

    player.moveTails()
    player.position.x -= 1
  },
  ArrowRight() {
    const firstTail = player.tails[0]
    if (player.position.x === 19) return
    if (Array.isArray(firstTail) && (player.position.x + 1 === firstTail[0] && player.position.y === firstTail[1])) return

    player.moveTails()
    player.position.x += 1
  },
}

const collisions = {
  food() {
    const position = `${player.position.x}-${player.position.y}`
    if (game.foods.has(position)) {
      game.foods.delete(position)
      player.tails.push([player.position.x, player.position.y])
      game.addFood(game.context)
    }
  },
}

const gameLoop = () => {
  game.lastTimeout = setTimeout(() => {
    const movement = movements[game.lastMovement]
    game.drawSquare(game.context, player.position.x, player.position.y)
    player.tails.forEach(([tailX, tailY]) => {
      game.drawSquare(game.context, tailX, tailY)
    })
    movement(game.context)
    game.drawPlayer(game.context, player.position.x, player.position.y)
    collisions.food()
    requestAnimationFrame(gameLoop)
  }, 150)
}

const scene = document.getElementById('game')
if (scene) {
  const context = scene.getContext('2d')
  game.context = context
  game.cleanScene(context)
  for (let i = 0; i < game.size; i++) {
    for (let k = 0; k < game.size; k++) {
      game.drawSquare(context, i, k)
    }
  }
  game.drawFood(context)
  game.drawPlayer(context, player.position.x, player.position.y)

  document.addEventListener('keydown', (event) => {
    event.preventDefault()
    const movement = movements[event.key]
    if (movement) {
      cancelAnimationFrame(game.lastLoop)
      clearTimeout(game.lastTimeout)
      game.drawSquare(context, player.position.x, player.position.y)
      player.tails.forEach(([tailX, tailY]) => {
        game.drawSquare(context, tailX, tailY)
      })
      movement(context)
      game.drawPlayer(context, player.position.x, player.position.y)

      collisions.food()

      game.lastMovement = event.key
      game.lastLoop = requestAnimationFrame(gameLoop)
    }
  })
}
