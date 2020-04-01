const assert = val => {
  if (typeof val !== 'number' || Number.isNaN(val)) {
    throw TypeError('The "parameter" should be a number.')
  }
}

const wobbly = t => -0.5 * Math.pow(2.71828, -6 * t) * (-2 * Math.pow(2.71828, 6 * t) + Math.sin(12 * t) + 2 * Math.cos(12 * t))

const filterOpts = opts => {
  const {
    end,
    duration,
    normal = false,
    move: [from, to],
  } = opts

  assert(to)
  assert(from)
  assert(duration)

  return { to, from, end, normal, duration }
}

const hexToRgb = hex => {
  if (!/^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/.test(hex)) {
    throw Error(`the "${hex}" do not meet specifications.`)
  }

  const rgba = []
  hex = hex.toLowerCase()

  // if hex is #fff
  if (hex.length === 4) {
    let regenerate = '#'
    for (let i = 1; i < 4; i++) {
      regenerate += hex.slice(i, i + 1).repeat(2)
    }
    hex = regenerate
  }

  for (let j = 1; j < 7; j += 2) {
    rgba.push(+('0x' + hex.slice(j, j + 2)))
  }

  if (hex.length === 9) {
    rgba.push(+('0x' + hex.slice(7, 9)) / 255)
  }

  return rgba
}

// core function
const Wobbly = (opts, process) => {
  const { to, from, end, normal, duration } = filterOpts(opts)
  typeof process !== 'function' && (process = () => {})

  let timerId = null
  let startTime = null
  const totalDistance = to - from

  const stopAnimate = () => {
    startTime = null
    if (timerId) {
      cancelAnimationFrame(timerId)
      timerId = null
      typeof end === 'function' && end()
    }
  }

  const core = () => {
    timerId = requestAnimationFrame(() => {
      let precent = (Date.now() - startTime) / duration
      if (Number.isNaN(precent)) return

      if (precent > 1) {
        process(to)
        stopAnimate()
        return
      }

      // get current move distance
      const destination = normal
        ? from + precent * totalDistance
        : from + wobbly(precent) * totalDistance

      process(destination)

      core()
    })
  }

  // return animate object
  return {
    // if we are doing animation, we don’t do anything
    start() {
      if (timerId === null) {
        startTime = Date.now()
        core()
      }
      return this
    },

    stop() {
      stopAnimate()
      return this
    },

    reStart() {
      this.stop()
      this.start()
      return this
    },

    toStart() {
      this.stop()
      process(from)
      return this
    },

    toEnd() {
      this.stop()
      process(to)
      return this
    }
  }
}

// export frame list data
Wobbly.export = (opts, ticker = 17) => {
  assert(ticker)
  let i = 0
  let precent = 0
  let cacheArray = null

  const { to, from, normal, duration } = filterOpts(opts)
  const totalDistance = to - from
  const frames = {}
  const res = {
    ticker,
    frames,
    length: 0,

    clearCache(newVal) {
      cacheArray = newVal || null
    },

    toArray(cache) {
      if (cacheArray !== null) {
        return cacheArray
      }
      const array = []
      for (const key in this.frames) {
        array.push([key, this.frames[key]])
      }
      if (cache) {
        cacheArray = array
      }
      return array
    },
  }

  while(precent <= 1) {
    res.length++
    const frame = i++ * ticker
    precent = frame / duration
    if (precent > 1) {
      if (frames[duration] === undefined) {
        frames[duration] = to
      }
      break
    }

    frames[frame] = normal
      ? from + precent * totalDistance
      : from + wobbly(precent) * totalDistance
  }
  return res
}

// allow multiple animations at the same time 
Wobbly.all = ({ moves, duration, normal, end }, process) => {
  if (!Array.isArray(moves) || moves.length === 0) {
    throw Error('The "moves" must be an array with one element.')
  }

  // process wrap function
  // we need index keep order of the data
  const processWrap = (currentIndex, des) => {
    processWrap._i++
    processWrap._des[currentIndex] = des
    if (processWrap._i === moves.length) {
      process(processWrap._des)
      processWrap._i = 0
      processWrap._des = []
    }
  }
  processWrap._i = 0
  processWrap._des = []

  // end wrap function
  let endWrap = null
  if (end) {
    endWrap = () => {
      endWrap._i++
      if (endWrap._i === moves.length) {
        endWrap._i = 0
        end()
      }
    }
    endWrap._i = 0
  }

  // create animates
  const animates = moves.map((move, i) => {
    return Wobbly({
      move,
      normal,
      duration,
      end: endWrap,
    }, des => processWrap(i, des))
  })

  // create apis
  const allApis = {}
  for (const key in animates[0]) {
    allApis[key] = function () {
      for (const animate of animates) {
        animate[key]()
      }
      return this
    }
  }
  return allApis
}

// simplified writing
Wobbly.move = (move, duration, process) => {
  return new Promise(resolve => {
    Wobbly({
      move,
      duration,
      end() {
        // next function will restart animation
        resolve(() => Wobbly.move(move, duration, process))
      },
    }, process).start()
  })
}

// conversion color value
Wobbly.color = (start, end) => {
  if (typeof end === 'string') {
    end = hexToRgb(end.trim())
  }

  if (typeof start === 'string') {
    start = hexToRgb(start.trim())
  }

  const maxLength = Math.max(start.length, end.length)
  end.length < maxLength && end.push(1)
  start.length < maxLength && start.push(1)

  return start.map((val, i) => [val, end[i]])
}

export default Wobbly
