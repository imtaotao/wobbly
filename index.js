const Wobbly = (() => {
  const assert = val => {
    if (typeof val !== 'number' || Number.isNaN(val)) {
      throw TypeError('The parameter should be a number.')
    }
  }
  
  const wobbly = t => -0.5 * Math.pow(2.71828, -6 * t) * (-2 * Math.pow(2.71828, 6 * t) + Math.sin(12 * t) + 2 * Math.cos(12 * t))

  const filterOpts = opts => {
    let {
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
  const WobblyCore = (opts, process) => {
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
      start () {
        if (timerId === null) {
          startTime = Date.now()
          core()
        }
        return this
      },

      stop () {
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

      toEnd () {
        this.stop()
        process(to)
        return this
      }
    }
  }

  // allow multiple animations at the same time 
  WobblyCore.all = ({ moves, duration, normal, end }, process) => {
    if (!Array.isArray(moves) || moves.length === 0) {
      throw Error('The "moves" must be an array with one element.')
    }

    // process wrap function
    // we need index keep order of the data
    const processWrap = (currentIndex, des) => {
      processWrap._i++
      processWrap._des[currentIndex] = (des)
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
      return WobblyCore({
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
  WobblyCore.move = (move, duration, process) => {
    return new Promise(resolve => {
      WobblyCore({
        move,
        duration,
        end: resolve,
      }, process).start()
    })
  }

  // conversion color value
  WobblyCore.color = (start, end) => {
    if (typeof end === 'string') {
      end = hexToRgb(end.trim())
    }

    if (typeof start === 'string') {
      start = hexToRgb(start.trim())
    }

    const result = []
    const maxLength = Math.max(start.length, end.length)
    
    end.length < maxLength && end.push(1)
    start.length < maxLength && start.push(1)
    
    for (let i = 0; i < maxLength; i++) {
      result[i] = [start[i], end[i]]
    }

    return result
  }

  return WobblyCore
})()
